/**
 * Unified Customer Identity Engine
 * Cross-channel fuzzy matching, similarity scoring, and identity graph resolution
 */

// Calculate Levenshtein distance between two strings
function levenshteinDistance(str1 = '', str2 = '') {
  const s1 = str1.toLowerCase().trim();
  const s2 = str2.toLowerCase().trim();
  const track = Array(s2.length + 1)
    .fill(null)
    .map(() => Array(s1.length + 1).fill(null));

  for (let i = 0; i <= s1.length; i += 1) {
    track[0][i] = i;
  }
  for (let j = 0; j <= s2.length; j += 1) {
    track[j][0] = j;
  }

  for (let j = 1; j <= s2.length; j += 1) {
    for (let i = 1; i <= s1.length; i += 1) {
      const indicator = s1[i - 1] === s2[j - 1] ? 0 : 1;
      track[j][i] = Math.min(
        track[j][i - 1] + 1, // deletion
        track[j - 1][i] + 1, // insertion
        track[j - 1][i - 1] + indicator // substitution
      );
    }
  }

  return track[s2.length][s1.length];
}

// Calculate string similarity percentage (0 - 100)
function calculateStringSimilarity(str1 = '', str2 = '') {
  if (!str1 || !str2) return 0;
  const s1 = str1.toLowerCase().trim();
  const s2 = str2.toLowerCase().trim();
  if (s1 === s2) return 100;
  const maxLength = Math.max(s1.length, s2.length);
  if (maxLength === 0) return 100;
  const distance = levenshteinDistance(s1, s2);
  return Math.round(((maxLength - distance) / maxLength) * 100);
}

// Normalize phone numbers: remove all non-digits, take last 10 digits
function normalizePhone(phone = '') {
  if (!phone) return '';
  const digits = phone.replace(/\D/g, '');
  return digits.length >= 10 ? digits.slice(-10) : digits;
}

// Compare two customer profiles and compute confidence score (0-100)
function evaluateCustomerMatch(c1, c2) {
  if (c1._id.toString() === c2._id.toString()) return { score: 0, matches: [] };

  let score = 0;
  const matchingAttributes = [];

  // 1. Phone number match
  const p1 = normalizePhone(c1.phone);
  const p2 = normalizePhone(c2.phone);
  if (p1 && p2 && p1 === p2) {
    score += 50;
    matchingAttributes.push(`Exact Phone Match (${c1.phone})`);
  }

  // 2. Email match
  const e1 = (c1.email || '').toLowerCase().trim();
  const e2 = (c2.email || '').toLowerCase().trim();
  if (e1 && e2) {
    if (e1 === e2) {
      score += 55;
      matchingAttributes.push(`Exact Email Match (${e1})`);
    } else {
      // Check username prefix match e.g. john.smith@gmail.com vs john.smith@company.org
      const prefix1 = e1.split('@')[0];
      const prefix2 = e2.split('@')[0];
      if (prefix1.length > 4 && prefix1 === prefix2) {
        score += 25;
        matchingAttributes.push(`Identical Email Handle (@${prefix1})`);
      }
    }
  }

  // 3. Name similarity (First name + Last name)
  const fullName1 = `${c1.firstName} ${c1.lastName}`.trim();
  const fullName2 = `${c2.firstName} ${c2.lastName}`.trim();
  const nameSim = calculateStringSimilarity(fullName1, fullName2);

  if (nameSim === 100) {
    score += 40;
    matchingAttributes.push(`Exact Name Match ("${fullName1}")`);
  } else if (nameSim >= 80) {
    score += Math.round((nameSim / 100) * 35);
    matchingAttributes.push(`Fuzzy Name Similarity (${nameSim}%: "${fullName1}" ~ "${fullName2}")`);
  }

  // 4. Postal Code / City match
  const zip1 = c1.address?.zipCode;
  const zip2 = c2.address?.zipCode;
  const city1 = (c1.address?.city || '').toLowerCase().trim();
  const city2 = (c2.address?.city || '').toLowerCase().trim();

  if (zip1 && zip2 && zip1 === zip2) {
    score += 15;
    matchingAttributes.push(`Matching Postal Code (${zip1})`);
  } else if (city1 && city2 && city1 === city2 && city1.length > 2) {
    score += 10;
    matchingAttributes.push(`Matching City (${city1})`);
  }

  // 5. Channel diversity bonus: different channels (e.g. store vs web) increases likelihood of fragmented profiles
  if (c1.channel !== c2.channel && score >= 40) {
    score += 5;
    matchingAttributes.push(`Cross-Channel Discrepancy (${c1.channel.toUpperCase()} & ${c2.channel.toUpperCase()})`);
  }

  // Cap score at 99 unless both email and phone are exact matches
  let finalScore = Math.min(100, score);
  if (finalScore >= 100 && !(e1 === e2 && p1 === p2)) {
    finalScore = 98;
  }

  return {
    score: finalScore,
    matches: matchingAttributes,
  };
}

module.exports = {
  levenshteinDistance,
  calculateStringSimilarity,
  normalizePhone,
  evaluateCustomerMatch,
};
