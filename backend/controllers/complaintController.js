const Complaint = require('../models/Complaint');
const { classifyComplaint } = require('../services/aiService');

exports.createComplaint = async (req, res) => {
  try {
    const { description, location } = req.body;
    if (!description || description.trim() === '') {
      return res.status(400).json({ success: false, message: 'Complaint description cannot be empty' });
    }
    
    // AI Classification
    const classification = await classifyComplaint(description);
    const attachments = req.files ? req.files.map(f => f.path) : [];
    
    const complaint = await Complaint.create({
      citizenId: req.user._id,
      description,
      location,
      category: classification.category,
      priority: classification.priority,
      assignedDepartment: classification.department,
      attachments
    });
    
    res.status(201).json({ success: true, data: complaint, classification });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getMyComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find({ citizenId: req.user._id })
      .sort({ createdAt: -1 })
      .populate('assignedOfficer', 'name email');
    res.json({ success: true, data: complaints });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getAllComplaints = async (req, res) => {
  try {
    const { status, category, priority, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (category) filter.category = category;
    if (priority) filter.priority = priority;
    if (req.user.role === 'officer') filter.assignedDepartment = req.user.department;
    
    const complaints = await Complaint.find(filter)
      .populate('citizenId', 'name email phone')
      .populate('assignedOfficer', 'name')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    
    const total = await Complaint.countDocuments(filter);
    res.json({ success: true, data: complaints, total, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateComplaintStatus = async (req, res) => {
  try {
    const { status, comment } = req.body;
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ success: false, message: 'Complaint not found' });
    
    complaint.status = status;
    if (status === 'resolved') complaint.resolvedAt = new Date();
    if (comment) complaint.comments.push({ text: comment, by: req.user._id });
    await complaint.save();
    
    res.json({ success: true, data: complaint });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getComplaintById = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id)
      .populate('citizenId', 'name email phone')
      .populate('assignedOfficer', 'name email')
      .populate('comments.by', 'name role');
    if (!complaint) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: complaint });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getStats = async (req, res) => {
  try {
    const stats = await Complaint.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    const categoryStats = await Complaint.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);
    res.json({ success: true, data: { statusStats: stats, categoryStats } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
