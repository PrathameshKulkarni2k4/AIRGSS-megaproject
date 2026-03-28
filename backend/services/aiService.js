// NLP Complaint Classification Service
const CATEGORY_KEYWORDS = {
  roads: ['road', 'pothole', 'bridge', 'path', 'street', 'highway', 'drainage'],
  water: ['water', 'pipe', 'tap', 'supply', 'leakage', 'drinking'],
  electricity: ['electricity', 'power', 'light', 'transformer', 'wire', 'current', 'outage'],
  sanitation: ['garbage', 'waste', 'toilet', 'sewage', 'cleaning', 'drain', 'filth'],
  health: ['health', 'hospital', 'doctor', 'medicine', 'clinic', 'disease', 'medical'],
  education: ['school', 'teacher', 'education', 'student', 'books', 'college'],
  corruption: ['bribe', 'corruption', 'fraud', 'misuse', 'illegal', 'scam'],
};

const DEPARTMENT_MAP = {
  roads: 'Public Works Department',
  water: 'Water Supply Department',
  electricity: 'Electricity Department',
  sanitation: 'Sanitation Department',
  health: 'Health Department',
  education: 'Education Department',
  corruption: 'Vigilance Department',
  other: 'General Administration',
};

const PRIORITY_KEYWORDS = {
  critical: ['urgent', 'emergency', 'critical', 'danger', 'accident', 'death', 'fire'],
  high: ['serious', 'major', 'severe', 'broken', 'not working', 'failed'],
  low: ['minor', 'small', 'request', 'suggestion'],
};

exports.classifyComplaint = async (text) => {
  const lower = text.toLowerCase();
  let category = 'other';
  let maxMatches = 0;
  for (const [cat, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    const matches = keywords.filter(k => lower.includes(k)).length;
    if (matches > maxMatches) { maxMatches = matches; category = cat; }
  }
  let priority = 'medium';
  for (const [p, keywords] of Object.entries(PRIORITY_KEYWORDS)) {
    if (keywords.some(k => lower.includes(k))) { priority = p; break; }
  }
  return { category, priority, department: DEPARTMENT_MAP[category] };
};

exports.recommendSchemes = async (citizen, schemes) => {
  return schemes.filter(scheme => {
    const r = scheme.eligibilityRules;
    if (r.maxIncome && citizen.income > r.maxIncome) return false;
    if (r.minAge && citizen.age < r.minAge) return false;
    if (r.maxAge && citizen.age > r.maxAge) return false;
    if (r.gender && r.gender !== 'all' && citizen.gender !== r.gender) return false;
    return true;
  });
};
