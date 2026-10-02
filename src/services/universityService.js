/**
 * UniversityService — Unified Indian Colleges & Universities Directory Service
 *
 * Integrates directly with MongoDB Atlas database:
 * - 54,244 Colleges (from AISHE directory)
 * - 1,362 Universities & Institutes of National Importance
 *
 * Search behavior:
 * - On initial load, does NOT show any colleges (empty list).
 * - As the user types (>= 2 characters), debounced queries search both
 *   colleges and universities from MongoDB Atlas and display them.
 */

import { API_BASE_URL } from '../lib/api';

const searchCache = new Map();
let currentAbortController = null;

/**
 * Searches colleges and universities from MongoDB Atlas
 * @param {string} query - search text
 * @returns {Promise<Array>} List of matching colleges and universities
 */
export async function searchUniversities(query) {
  // Pre-check browser offline status
  if (typeof navigator !== 'undefined' && navigator.onLine === false) {
    throw new Error('NETWORK_OFFLINE');
  }

  const q = (query || '').trim();

  // Per user requirement: Do not show any college until user starts searching
  if (!q || q.length < 2) {
    return [];
  }

  const lowerQ = q.toLowerCase();
  if (searchCache.has(lowerQ)) {
    return searchCache.get(lowerQ);
  }

  if (currentAbortController) {
    currentAbortController.abort();
  }
  currentAbortController = new AbortController();
  const signal = currentAbortController.signal;

  try {
    const res = await fetch(`${API_BASE_URL}/universities?q=${encodeURIComponent(q)}&limit=60`, {
      signal,
      headers: { 'Accept': 'application/json' }
    });

    if (!res.ok) {
      throw new Error('NETWORK_OFFLINE');
    }

    const data = await res.json();
    const results = (data.universities || []).map(u => ({
      id: u.id || u._id,
      _id: u._id || u.id,
      name: u.name,
      type: u.type || 'College',
      universityName: u.universityName || '',
      city: u.city || '',
      state: u.state || '',
      country: u.country || 'India',
      website: u.website || '',
      aisheCode: u.aisheCode || '',
      verified: u.verified !== false
    }));

    searchCache.set(lowerQ, results);
    return results;
  } catch (err) {
    if (err.name === 'AbortError') {
      return [];
    }
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      throw new Error('NETWORK_OFFLINE');
    }
    throw err;
  }
}

/**
 * Alias for server-based search
 */
export async function searchUniversitiesOnServer(query, country, state) {
  return searchUniversities(query);
}

/**
 * Mock request submission for university onboarding modal
 */
export async function submitUniversityRequest() {
  return { success: true };
}

// ─── India Specific Constants ─────────────────────────────────────────────

export const COUNTRIES = [
  { id: 'IN', name: 'India', flagEmoji: '🇮🇳', isoCode: 'IND' }
];

export const STATES = {
  IN: [
    { id: 'AP', name: 'Andhra Pradesh' },
    { id: 'AR', name: 'Arunachal Pradesh' },
    { id: 'AS', name: 'Assam' },
    { id: 'BR', name: 'Bihar' },
    { id: 'CG', name: 'Chhattisgarh' },
    { id: 'DL', name: 'Delhi' },
    { id: 'GA', name: 'Goa' },
    { id: 'GJ', name: 'Gujarat' },
    { id: 'HR', name: 'Haryana' },
    { id: 'HP', name: 'Himachal Pradesh' },
    { id: 'JH', name: 'Jharkhand' },
    { id: 'KA', name: 'Karnataka' },
    { id: 'KL', name: 'Kerala' },
    { id: 'MP', name: 'Madhya Pradesh' },
    { id: 'MH', name: 'Maharashtra' },
    { id: 'MN', name: 'Manipur' },
    { id: 'ML', name: 'Meghalaya' },
    { id: 'MZ', name: 'Mizoram' },
    { id: 'NL', name: 'Nagaland' },
    { id: 'OD', name: 'Odisha' },
    { id: 'PB', name: 'Punjab' },
    { id: 'RJ', name: 'Rajasthan' },
    { id: 'SK', name: 'Sikkim' },
    { id: 'TN', name: 'Tamil Nadu' },
    { id: 'TS', name: 'Telangana' },
    { id: 'TR', name: 'Tripura' },
    { id: 'UP', name: 'Uttar Pradesh' },
    { id: 'UK', name: 'Uttarakhand' },
    { id: 'WB', name: 'West Bengal' }
  ]
};
