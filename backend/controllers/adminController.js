const Citizen = require('../models/Citizen');
const Complaint = require('../models/Complaint');
const Payment = require('../models/Payment');
const Document = require('../models/Document');
const Fund = require('../models/Fund');
const ActivityLog = require('../models/ActivityLog');

exports.getDashboardStats = async (req, res) => {
  try {
    const [totalCitizens, totalComplaints, resolvedComplaints, pendingDocs, totalPayments, funds] = await Promise.all([
      Citizen.countDocuments({ role: 'citizen' }),
      Complaint.countDocuments(),
      Complaint.countDocuments({ status: 'resolved' }),
      Document.countDocuments({ status: 'requested' }),
      Payment.aggregate([{ $match: { status: 'success' } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
      Fund.find()
    ]);
    const complaintsByCategory = await Complaint.aggregate([{ $group: { _id: '$category', count: { $sum: 1 } } }]);
    const complaintsByStatus = await Complaint.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]);
    const recentComplaints = await Complaint.find().sort({ createdAt: -1 }).limit(5).populate('citizenId', 'name');
    res.json({
      success: true, data: {
        totalCitizens, totalComplaints, resolvedComplaints,
        pendingDocs, totalRevenue: totalPayments[0]?.total || 0,
        funds, complaintsByCategory, complaintsByStatus, recentComplaints
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getAllCitizens = async (req, res) => {
  try {
    const citizens = await Citizen.find().select('-password').sort({ createdAt: -1 });
    res.json({ success: true, data: citizens });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateCitizenRole = async (req, res) => {
  try {
    const { role, department } = req.body;
    const citizen = await Citizen.findByIdAndUpdate(req.params.id, { role, department }, { new: true }).select('-password');
    if (!citizen) return res.status(404).json({ success: false, message: 'Citizen not found' });
    res.json({ success: true, data: citizen });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getFunds = async (req, res) => {
  try {
    const funds = await Fund.find().populate('managedBy', 'name');
    res.json({ success: true, data: funds });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createFund = async (req, res) => {
  try {
    const fund = await Fund.create({ ...req.body, managedBy: req.user._id });
    res.status(201).json({ success: true, data: fund });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateFund = async (req, res) => {
  try {
    const fund = await Fund.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!fund) return res.status(404).json({ success: false, message: 'Fund not found' });
    res.json({ success: true, data: fund });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getActivityLogs = async (req, res) => {
  try {
    const logs = await ActivityLog.find().populate('userId', 'name email role').sort({ createdAt: -1 }).limit(100);
    res.json({ success: true, data: logs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
