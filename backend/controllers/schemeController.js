const Scheme = require('../models/Scheme');
const Citizen = require('../models/Citizen');

exports.getRecommendedSchemes = async (req, res) => {
  try {
    const citizen = await Citizen.findById(req.user._id);
    if (!citizen.profileComplete) {
      return res.status(400).json({ success: false, message: 'Please complete your profile to get scheme recommendations' });
    }
    const schemes = await Scheme.find({ isActive: true });
    const recommended = schemes.filter(scheme => {
      const r = scheme.eligibilityRules;
      if (r.maxIncome && citizen.income > r.maxIncome) return false;
      if (r.minAge && citizen.age < r.minAge) return false;
      if (r.maxAge && citizen.age > r.maxAge) return false;
      if (r.gender && r.gender !== 'all' && citizen.gender !== r.gender) return false;
      if (r.occupation && r.occupation.length > 0 && !r.occupation.includes(citizen.occupation)) return false;
      return true;
    });
    recommended.sort((a, b) => {
      let scoreA = 0, scoreB = 0;
      if (a.eligibilityRules.maxIncome && citizen.income < a.eligibilityRules.maxIncome * 0.5) scoreA += 2;
      if (b.eligibilityRules.maxIncome && citizen.income < b.eligibilityRules.maxIncome * 0.5) scoreB += 2;
      return scoreB - scoreA;
    });
    res.json({ success: true, data: recommended, total: recommended.length });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getAllSchemes = async (req, res) => {
  try {
    const schemes = await Scheme.find().sort({ createdAt: -1 });
    res.json({ success: true, data: schemes });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createScheme = async (req, res) => {
  try {
    const scheme = await Scheme.create(req.body);
    res.status(201).json({ success: true, data: scheme });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateScheme = async (req, res) => {
  try {
    const scheme = await Scheme.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!scheme) return res.status(404).json({ success: false, message: 'Scheme not found' });
    res.json({ success: true, data: scheme });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteScheme = async (req, res) => {
  try {
    await Scheme.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Scheme deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
