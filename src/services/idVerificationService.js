import Tesseract from 'tesseract.js';

// Clean text: lowercase and remove special characters
function cleanString(str) {
  if (!str) return '';
  return str
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// Levenshtein distance for fuzzy tolerance
function levenshtein(a, b) {
  const m = a.length, n = b.length;
  const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[m][n];
}

// Check if needle exists in words or haystack with fuzzy tolerance
function fuzzyWordMatch(haystackWords, needle, maxDist = 1) {
  if (!needle || needle.length < 2) return false;
  needle = needle.toLowerCase();
  for (const word of haystackWords) {
    if (word === needle) return true;
    if (needle.length >= 4 && Math.abs(word.length - needle.length) <= maxDist) {
      if (levenshtein(word, needle) <= maxDist) return true;
    }
  }
  return false;
}

// Generate common acronyms and abbreviation patterns from a university name
function extractUniversityAliases(uniName) {
  if (!uniName) return [];
  const aliases = new Set();
  const raw = uniName.trim();
  
  // 1. Text inside parentheses, e.g. "REC (NIT) Jalandhar" -> "nit"
  const parenMatches = raw.match(/\(([^)]+)\)/g);
  if (parenMatches) {
    parenMatches.forEach(p => {
      const clean = cleanString(p);
      if (clean) aliases.add(clean);
    });
  }

  // 2. Acronym from capital words (e.g. National Institute of Technology -> nit)
  const words = raw.split(/\s+/).filter(w => w.length > 0);
  const initials = words
    .filter(w => !['of', 'and', 'in', 'for', 'the', 'at', 'to', '&'].includes(w.toLowerCase()))
    .map(w => w[0].toLowerCase())
    .join('');
  if (initials.length >= 2) aliases.add(initials);

  // 3. Common abbreviations (NIT, IIT, IIIT, BITS, DU, DTU, etc.)
  const upperPattern = raw.match(/\b[A-Z]{2,6}\b/g);
  if (upperPattern) {
    upperPattern.forEach(u => aliases.add(u.toLowerCase()));
  }

  return Array.from(aliases);
}

/**
 * Verify Student ID card image against university and name
 * @param {File|Blob|string} imageFile
 * @param {Object} credentials - { university, name }
 * @param {Function} onProgress - Callback for OCR and step progress updates
 */
export async function verifyStudentIdCard(imageFile, credentials, onProgress = () => {}) {
  const { university, name } = credentials;
  const uniName = typeof university === 'string' ? university : (university?.name || '');
  const uniCity = university?.city || '';
  const studentName = (name || '').trim();

  try {
    onProgress({
      phase: 'scanning',
      percentage: 15,
      message: 'Loading OCR optical recognition engine...'
    });

    const ocrResult = await Tesseract.recognize(
      imageFile,
      'eng',
      {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            const pct = Math.min(85, Math.max(20, Math.round(m.progress * 85)));
            onProgress({
              phase: 'scanning',
              percentage: pct,
              message: `Reading document text (${pct}%)...`
            });
          }
        }
      }
    );

    const extractedRawText = ocrResult?.data?.text || '';
    const cleanExtracted = cleanString(extractedRawText);
    const extractedWords = cleanExtracted.split(/\s+/).filter(Boolean);

    onProgress({
      phase: 'verifying_campus',
      percentage: 90,
      message: `Analyzing campus affiliation...`
    });

    // ── 1. CAMPUS MATCHING LOGIC ─────────────────────────────────────────────
    let campusMatched = false;
    let campusMatchReason = '';

    const cleanUni = cleanString(uniName);
    const cleanCity = cleanString(uniCity);
    const uniAliases = extractUniversityAliases(uniName);

    // List of significant keywords from college name (exclude generic stop words)
    const stopWords = new Set(['of', 'and', 'the', 'in', 'for', 'at', 'to', 'rec', 'dr', 'b', 'r', 'st']);
    const uniTokens = cleanUni
      .split(/\s+/)
      .filter(w => w.length >= 3 && !stopWords.has(w));

    // Check direct substring
    if (cleanUni.length > 5 && cleanExtracted.includes(cleanUni)) {
      campusMatched = true;
      campusMatchReason = 'Exact campus name match';
    }

    // Check alias match + (city or significant word)
    if (!campusMatched) {
      for (const alias of uniAliases) {
        if (alias.length >= 2 && extractedWords.includes(alias)) {
          // If alias matches, check if city or token also matches
          if (cleanCity && extractedWords.includes(cleanCity)) {
            campusMatched = true;
            campusMatchReason = `Campus acronym (${alias.toUpperCase()}) and city (${uniCity}) matched`;
            break;
          }
          const hasToken = uniTokens.some(t => extractedWords.includes(t));
          if (hasToken) {
            campusMatched = true;
            campusMatchReason = `Campus acronym (${alias.toUpperCase()}) matched`;
            break;
          }
        }
      }
    }

    // Check significant tokens overlap (e.g. "jalandhar", "ambedkar", "technology")
    if (!campusMatched && uniTokens.length > 0) {
      const matchedTokens = uniTokens.filter(token =>
        extractedWords.includes(token) || fuzzyWordMatch(extractedWords, token, 1)
      );

      // If at least 2 key words match, or >= 40% of tokens match
      if (matchedTokens.length >= 2 || (matchedTokens.length >= 1 && (matchedTokens.length / uniTokens.length) >= 0.4)) {
        campusMatched = true;
        campusMatchReason = `Key college terms matched: ${matchedTokens.slice(0, 3).join(', ')}`;
      }
    }

    // Check city match alone if city has >= 4 characters and university word matched
    if (!campusMatched && cleanCity.length >= 4 && cleanExtracted.includes(cleanCity)) {
      const hasAnyUniWord = uniTokens.some(t => extractedWords.includes(t));
      if (hasAnyUniWord) {
        campusMatched = true;
        campusMatchReason = `Campus location (${uniCity}) and identifier matched`;
      }
    }

    // ── 2. STUDENT NAME MATCHING LOGIC ───────────────────────────────────────
    onProgress({
      phase: 'verifying_name',
      percentage: 95,
      message: `Verifying student name credentials...`
    });

    let nameMatched = false;
    let nameMatchReason = '';

    const cleanUser = cleanString(studentName);
    const nameParts = cleanUser.split(/\s+/).filter(p => p.length >= 2);

    if (cleanUser && cleanExtracted.includes(cleanUser)) {
      nameMatched = true;
      nameMatchReason = 'Full name matched';
    } else if (nameParts.length > 0) {
      // Check each name part (first name, last name)
      const firstName = nameParts[0];
      const lastName = nameParts[nameParts.length - 1];

      const firstMatched = fuzzyWordMatch(extractedWords, firstName, firstName.length >= 5 ? 1 : 0);
      const lastMatched = nameParts.length > 1 ? fuzzyWordMatch(extractedWords, lastName, lastName.length >= 5 ? 1 : 0) : false;

      if (firstMatched && lastMatched) {
        nameMatched = true;
        nameMatchReason = 'First and last name matched';
      } else if (firstMatched && firstName.length >= 3) {
        nameMatched = true;
        nameMatchReason = `First name (${studentName.split(' ')[0]}) matched`;
      } else if (lastMatched && lastName.length >= 3) {
        nameMatched = true;
        nameMatchReason = `Last name (${studentName.split(' ').slice(-1)[0]}) matched`;
      }
    }

    onProgress({
      phase: 'complete',
      percentage: 100,
      message: 'Verification evaluation complete.'
    });

    const isVerified = campusMatched && nameMatched;

    return {
      success: isVerified,
      campusMatched,
      campusMatchReason,
      nameMatched,
      nameMatchReason,
      extractedText: extractedRawText,
      failureReason: !campusMatched && !nameMatched
        ? 'Neither your student name nor your selected campus could be identified on this ID card.'
        : !campusMatched
        ? `The selected campus ("${uniName}") was not detected on the uploaded ID card.`
        : `The student name ("${studentName}") was not detected on the uploaded ID card.`
    };
  } catch (err) {
    console.error('ID Card Verification error:', err);
    return {
      success: false,
      campusMatched: false,
      nameMatched: false,
      extractedText: '',
      failureReason: 'Unable to scan or read the ID card. Please upload a clear JPG or PNG photo of your student ID card.'
    };
  }
}
