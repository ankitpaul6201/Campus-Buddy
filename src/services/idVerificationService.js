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
function extractUniversityAliases(uniName, uniCity = '') {
  if (!uniName) return [];
  const aliases = new Set();
  const raw = uniName.trim();
  const lower = raw.toLowerCase();

  // 1. NIT pattern: e.g. National Institute of Technology Jalandhar -> nit, nitj, nit jalandhar
  if (lower.includes('national institute of technology')) {
    aliases.add('nit');
    const cityMatch = lower.match(/jalandhar|surathkal|trichy|warangal|calicut|roorkee|silchar|rourkela|kurukshetra|durgapur|jaipur|allahabad|bhopal|nagpur|patna|raipur|srinagar|hamirpur|delhi|goa|puducherry|meghalaya|manipur|mizoram|nagaland|sikkim|agartala|arunachal|andhra|uttarakhand/);
    const c = cityMatch ? cityMatch[0] : (uniCity ? uniCity.toLowerCase() : '');
    if (c) {
      aliases.add(`nit ${c}`);
      aliases.add(`nit${c[0]}`);
      if (c === 'jalandhar') {
        aliases.add('nitj');
        aliases.add('rec');
        aliases.add('rec jalandhar');
      }
      if (c === 'kurukshetra') aliases.add('nitkkr');
      if (c === 'surathkal') aliases.add('nitk');
      if (c === 'trichy') aliases.add('nitt');
      if (c === 'warangal') aliases.add('nitw');
      if (c === 'rourkela') aliases.add('nitr');
      if (c === 'durgapur') aliases.add('nitdgp');
    }
  }

  // 2. IIT pattern
  if (lower.includes('indian institute of technology')) {
    aliases.add('iit');
    const cityMatch = lower.match(/delhi|bombay|madras|kanpur|kharagpur|roorkee|guwahati|hyderabad|indore|varanasi|bhu|patna|gandhinagar|ropar|bhubaneswar|jodhpur|mandi|tirupati|palakkad|dharwad|bhilai|goa|jammu/);
    const c = cityMatch ? cityMatch[0] : (uniCity ? uniCity.toLowerCase() : '');
    if (c) {
      aliases.add(`iit ${c}`);
      aliases.add(`iit${c[0]}`);
      if (c === 'kharagpur') aliases.add('iitkgp');
      if (c === 'bombay') aliases.add('iitb');
      if (c === 'delhi') aliases.add('iitd');
      if (c === 'madras') aliases.add('iitm');
    }
  }

  // 3. IIIT pattern
  if (lower.includes('indian institute of information technology')) {
    aliases.add('iiit');
  }

  // 4. BITS / BIT pattern
  if (lower.includes('birla institute of technology')) {
    aliases.add('bits');
    aliases.add('bit');
  }

  // 5. Parentheses abbreviations e.g. "REC (NIT) Jalandhar" -> "nit"
  const parenMatches = raw.match(/\(([^)]+)\)/g);
  if (parenMatches) {
    parenMatches.forEach(p => {
      const clean = cleanString(p);
      if (clean) aliases.add(clean);
    });
  }

  // 6. Direct acronym from significant words
  const words = cleanString(raw).split(/\s+/).filter(w => w.length > 0 && !['of', 'and', 'in', 'for', 'the', 'at', 'to', '&'].includes(w));
  const initials = words.map(w => w[0]).join('');
  if (initials.length >= 2) aliases.add(initials);

  // 7. Common capital abbreviations (NIT, IIT, IIIT, BITS, DU, DTU, NSUT, etc.)
  const upperPattern = raw.match(/\b[A-Z]{2,6}\b/g);
  if (upperPattern) {
    upperPattern.forEach(u => aliases.add(u.toLowerCase()));
  }

  return Array.from(aliases);
}

/**
 * Loads an image file/blob into an HTMLImageElement
 */
function loadImageElement(source) {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || typeof Image === 'undefined') {
      return reject(new Error('Browser window environment required'));
    }
    const img = new Image();
    img.crossOrigin = 'anonymous';

    let objectUrl = null;
    if (source instanceof Blob || source instanceof File) {
      objectUrl = URL.createObjectURL(source);
      img.src = objectUrl;
    } else if (typeof source === 'string') {
      img.src = source;
    } else {
      return reject(new Error('Unsupported image format'));
    }

    img.onload = () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
      resolve(img);
    };
    img.onerror = (e) => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
      reject(e);
    };
  });
}

/**
 * Preprocesses ID card image using HTML5 Canvas:
 * 1. Upscales image to high resolution (min 1400px width) for sharp OCR rendering.
 * 2. Analyzes top banner (top 38% where header text/crest resides).
 *    If the banner is dark (e.g. navy, purple, maroon, black) with white text,
 *    inverts that banner region on the canvas so white text becomes crisp dark text on light background.
 * 3. Creates a dedicated high-contrast inverted header crop (top 42%) for targeted header OCR fallback.
 */
function prepareIdCardCanvases(img) {
  if (typeof document === 'undefined') return null;

  try {
    const origW = img.naturalWidth || img.width || 800;
    const origH = img.naturalHeight || img.height || 600;

    // High resolution upscale (target 1400px width min)
    const targetW = Math.max(1400, origW);
    const scale = targetW / origW;
    const targetH = Math.round(origH * scale);

    // 1. Full canvas
    const fullCanvas = document.createElement('canvas');
    fullCanvas.width = targetW;
    fullCanvas.height = targetH;
    const fullCtx = fullCanvas.getContext('2d', { willReadFrequently: true });
    fullCtx.drawImage(img, 0, 0, targetW, targetH);

    // Sample top 38% banner
    const headerH = Math.floor(targetH * 0.38);
    const headerData = fullCtx.getImageData(0, 0, targetW, headerH);
    const d = headerData.data;

    let totalLuma = 0;
    const pixelCount = d.length / 4;
    for (let i = 0; i < d.length; i += 4) {
      totalLuma += (0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2]);
    }
    const avgLuma = totalLuma / Math.max(1, pixelCount);
    // Dark header detected if average luminance is < 145 (e.g. dark purple/blue banner)
    const isDarkHeader = avgLuma < 145;

    // 2. Dedicated high-contrast header crop (top 42%)
    const headerCanvas = document.createElement('canvas');
    headerCanvas.width = targetW;
    const cropH = Math.floor(targetH * 0.42);
    headerCanvas.height = cropH;
    const headerCtx = headerCanvas.getContext('2d', { willReadFrequently: true });
    headerCtx.drawImage(img, 0, 0, origW, Math.floor(origH * 0.42), 0, 0, targetW, cropH);

    const cropData = headerCtx.getImageData(0, 0, targetW, cropH);
    const cd = cropData.data;

    for (let i = 0; i < cd.length; i += 4) {
      let r = cd[i], g = cd[i + 1], b = cd[i + 2];
      if (isDarkHeader) {
        // Invert dark background so white text becomes dark black
        r = 255 - r;
        g = 255 - g;
        b = 255 - b;
      }
      // Contrast stretch
      const luma = 0.299 * r + 0.587 * g + 0.114 * b;
      const enhanced = luma < 128 ? Math.max(0, luma * 0.6) : Math.min(255, luma * 1.35);
      cd[i] = enhanced;
      cd[i + 1] = enhanced;
      cd[i + 2] = enhanced;
    }
    headerCtx.putImageData(cropData, 0, 0);

    // If banner was dark, invert top banner on full canvas as well so full scan sees both header and body
    if (isDarkHeader) {
      for (let i = 0; i < d.length; i += 4) {
        d[i] = 255 - d[i];
        d[i + 1] = 255 - d[i + 1];
        d[i + 2] = 255 - d[i + 2];
      }
      fullCtx.putImageData(headerData, 0, 0);
    }

    return {
      fullCanvas,
      headerCanvas,
      isDarkHeader
    };
  } catch (err) {
    console.warn('Canvas preprocessing fallback:', err);
    return null;
  }
}

/**
 * Core matching evaluation between extracted OCR text and user credentials
 */
export function evaluateVerification(extractedRawText, credentials) {
  const { university, name } = credentials;
  const uniName = typeof university === 'string' ? university : (university?.name || university?.universityName || '');
  const uniCity = (typeof university === 'object' && university?.city) ? university.city : '';
  const uniState = (typeof university === 'object' && university?.state) ? university.state : '';
  const studentName = (name || '').trim();

  const cleanExtracted = cleanString(extractedRawText);
  const extractedWords = cleanExtracted.split(/\s+/).filter(Boolean);

  // ── 1. CAMPUS MATCHING LOGIC ─────────────────────────────────────────────
  let campusMatched = false;
  let campusMatchReason = '';

  const cleanUni = cleanString(uniName);
  const cleanCity = cleanString(uniCity);
  const cleanState = cleanString(uniState);

  // Words that are generic academic descriptors
  const genericAcademicWords = new Set([
    'national', 'institute', 'institutes', 'technology', 'university', 'college', 'colleges',
    'engineering', 'polytechnic', 'autonomous', 'ministry', 'education', 'govt', 'government',
    'india', 'indian', 'deemed', 'state', 'central', 'vidyapeeth', 'vishwa', 'vidyalaya',
    'of', 'and', 'the', 'in', 'for', 'at', 'to', 'st', 'dr', 'b', 'r', 'shri', 'smt', 'sir'
  ]);

  const stopWords = new Set(['of', 'and', 'the', 'in', 'for', 'at', 'to', 'st', 'dr', 'b', 'r']);

  // All meaningful words in college name
  const allUniWords = cleanUni
    .split(/\s+/)
    .filter(w => w.length >= 3 && !stopWords.has(w));

  // Distinctive words (e.g. "ambedkar", "jalandhar")
  const distinctiveTokens = allUniWords.filter(w => !genericAcademicWords.has(w) && w.length >= 4);

  // Add city if not already included
  if (cleanCity && cleanCity.length >= 4 && !distinctiveTokens.includes(cleanCity)) {
    distinctiveTokens.push(cleanCity);
  }

  // Academic words (e.g. "national", "technology", "institute")
  const academicTokens = allUniWords.filter(w => genericAcademicWords.has(w) && w.length >= 4);

  // Rich aliases (e.g. "nit", "nitj", "nit jalandhar", "rec jalandhar")
  const uniAliases = extractUniversityAliases(uniName, uniCity);

  // A. Direct full name or strong substring match
  if (cleanUni.length > 5 && cleanExtracted.includes(cleanUni)) {
    campusMatched = true;
    campusMatchReason = 'Exact campus name matched';
  }

  // B. Specific acronym match (e.g. "nitj", "iitd", "bits")
  if (!campusMatched) {
    for (const alias of uniAliases) {
      if (alias.length >= 3 && (extractedWords.includes(alias) || cleanExtracted.includes(alias))) {
        if (alias.length >= 4 || ['nitj', 'iitd', 'iitb', 'iitk', 'nitk', 'nitt', 'nitw', 'bits'].includes(alias)) {
          campusMatched = true;
          campusMatchReason = `Campus acronym (${alias.toUpperCase()}) matched`;
          break;
        }
      }
    }
  }

  // C. Distinctive token match (e.g. "ambedkar" or "jalandhar")
  if (!campusMatched && distinctiveTokens.length > 0) {
    const matchedDistinctive = distinctiveTokens.filter(token =>
      extractedWords.includes(token) ||
      fuzzyWordMatch(extractedWords, token, token.length >= 6 ? 1 : 0) ||
      cleanExtracted.includes(token)
    );

    if (matchedDistinctive.length >= 1) {
      const hasAnyAcademic = academicTokens.some(t => extractedWords.includes(t) || fuzzyWordMatch(extractedWords, t, 1));
      const hasAnyAlias = uniAliases.some(a => extractedWords.includes(a));
      const hasLocation = (cleanState && cleanExtracted.includes(cleanState)) ||
                          (cleanCity && cleanExtracted.includes(cleanCity)) ||
                          cleanExtracted.includes('punjab') ||
                          cleanExtracted.includes('144008') || // NIT Jalandhar PIN code
                          cleanExtracted.includes('0181');    // Jalandhar STD code

      // A single strong distinctive word (e.g. "ambedkar" or "jalandhar") combined with academic hints,
      // or 2 distinctive tokens, or a long distinctive name (>= 7 chars)
      if (matchedDistinctive.length >= 2 || hasAnyAcademic || hasAnyAlias || hasLocation || matchedDistinctive[0].length >= 7) {
        campusMatched = true;
        campusMatchReason = `Distinctive campus identifier matched: ${matchedDistinctive.join(', ')}`;
      }
    }
  }

  // D. Alias + Location or Academic word (e.g. "nit" + "jalandhar", "nit" + "punjab", "nit" + "144008")
  if (!campusMatched) {
    for (const alias of uniAliases) {
      if (alias.length >= 2 && (extractedWords.includes(alias) || cleanExtracted.includes(alias))) {
        const hasLocation = (cleanCity && cleanExtracted.includes(cleanCity)) ||
                            (cleanState && cleanExtracted.includes(cleanState)) ||
                            cleanExtracted.includes('punjab') ||
                            cleanExtracted.includes('144008');
        const hasUniToken = allUniWords.some(t => extractedWords.includes(t) || fuzzyWordMatch(extractedWords, t, 1));
        if (hasLocation || hasUniToken) {
          campusMatched = true;
          campusMatchReason = `Campus acronym (${alias.toUpperCase()}) and credentials matched`;
          break;
        }
      }
    }
  }

  // E. Address / PIN code / City match
  if (!campusMatched) {
    if (cleanUni.includes('jalandhar') && (cleanExtracted.includes('144008') || cleanExtracted.includes('jalandhar'))) {
      campusMatched = true;
      campusMatchReason = 'Campus location (Jalandhar) and address matched';
    }
  }

  // F. Multiple university tokens overlap
  if (!campusMatched && allUniWords.length > 0) {
    const matchedTokens = allUniWords.filter(token =>
      extractedWords.includes(token) || fuzzyWordMatch(extractedWords, token, 1)
    );
    if (matchedTokens.length >= 2 || (allUniWords.length <= 2 && matchedTokens.length >= 1)) {
      campusMatched = true;
      campusMatchReason = `Campus terms matched: ${matchedTokens.slice(0, 3).join(', ')}`;
    }
  }

  // ── 2. STUDENT NAME MATCHING LOGIC ───────────────────────────────────────
  let nameMatched = false;
  let nameMatchReason = '';

  const cleanUser = cleanString(studentName);
  const nameParts = cleanUser.split(/\s+/).filter(p => p.length >= 2);

  if (cleanUser && (cleanExtracted.includes(cleanUser) || extractedWords.includes(cleanUser))) {
    nameMatched = true;
    nameMatchReason = 'Full name matched';
  } else if (nameParts.length > 0) {
    const firstName = nameParts[0];
    const lastName = nameParts[nameParts.length - 1];

    const firstMatched = fuzzyWordMatch(extractedWords, firstName, firstName.length >= 5 ? 1 : 0) || cleanExtracted.includes(firstName);
    const lastMatched = nameParts.length > 1
      ? (fuzzyWordMatch(extractedWords, lastName, lastName.length >= 5 ? 1 : 0) || cleanExtracted.includes(lastName))
      : false;

    if (firstMatched && lastMatched) {
      nameMatched = true;
      nameMatchReason = 'First and last name matched';
    } else if (firstMatched && firstName.length >= 3) {
      nameMatched = true;
      nameMatchReason = `First name (${nameParts[0]}) matched`;
    } else if (lastMatched && lastName.length >= 3) {
      nameMatched = true;
      nameMatchReason = `Last name (${nameParts[nameParts.length - 1]}) matched`;
    }
  }

  const isVerified = campusMatched && nameMatched;

  return {
    success: isVerified,
    campusMatched,
    campusMatchReason,
    nameMatched,
    nameMatchReason,
    extractedText: extractedRawText,
    failureReason: isVerified
      ? ''
      : !campusMatched && !nameMatched
      ? 'Neither your student name nor your selected campus could be identified on this ID card.'
      : !campusMatched
      ? `The selected campus ("${uniName}") was not detected on the uploaded ID card.`
      : `The student name ("${studentName}") was not detected on the uploaded ID card.`
  };
}

/**
 * Verify Student ID card image against university and name
 * @param {File|Blob|string} imageFile
 * @param {Object} credentials - { university, name }
 * @param {Function} onProgress - Callback for OCR and step progress updates
 */
export async function verifyStudentIdCard(imageFile, credentials, onProgress = () => {}) {
  const { university, name } = credentials;
  const uniName = typeof university === 'string' ? university : (university?.name || university?.universityName || '');
  const studentName = (name || '').trim();

  try {
    onProgress({
      phase: 'scanning',
      percentage: 15,
      message: 'Preparing document image and loading OCR engine...'
    });

    // 1. Prepare canvases (preprocesses dark header banner with color inversion and upscale)
    let preprocessed = null;
    try {
      const imgElem = await loadImageElement(imageFile);
      preprocessed = prepareIdCardCanvases(imgElem);
    } catch (prepErr) {
      console.warn('Preprocessing skipped, proceeding with raw image:', prepErr);
    }

    const primaryImage = preprocessed?.fullCanvas || imageFile;

    // 2. Run Pass 1 OCR
    const ocrResult = await Tesseract.recognize(
      primaryImage,
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

    let extractedRawText = ocrResult?.data?.text || '';
    let evalResult = evaluateVerification(extractedRawText, credentials);

    // 3. Fallback Pass 2: If campus is not yet matched and we have dedicated header canvas
    if (!evalResult.campusMatched && preprocessed?.headerCanvas) {
      onProgress({
        phase: 'scanning',
        percentage: 88,
        message: 'Scanning ID card institutional header...'
      });

      try {
        const headerResult = await Tesseract.recognize(preprocessed.headerCanvas, 'eng');
        const headerText = headerResult?.data?.text || '';
        if (headerText.trim()) {
          extractedRawText = `${headerText}\n${extractedRawText}`;
          evalResult = evaluateVerification(extractedRawText, credentials);
        }
      } catch (headerErr) {
        console.warn('Header OCR fallback error:', headerErr);
      }
    }

    // 4. Fallback Pass 3: If still not matched, try raw image file directly
    if (!evalResult.campusMatched && primaryImage !== imageFile) {
      try {
        const rawResult = await Tesseract.recognize(imageFile, 'eng');
        const rawText = rawResult?.data?.text || '';
        if (rawText.trim()) {
          extractedRawText = `${extractedRawText}\n${rawText}`;
          evalResult = evaluateVerification(extractedRawText, credentials);
        }
      } catch (rawErr) {
        console.warn('Raw file fallback error:', rawErr);
      }
    }

    onProgress({
      phase: evalResult.success ? 'complete' : (evalResult.campusMatched ? 'verifying_name' : 'verifying_campus'),
      percentage: 100,
      message: evalResult.success ? 'Verification evaluation complete.' : 'Verification check completed.'
    });

    return evalResult;
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

