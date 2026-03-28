const path = require('path');
const Document = require('../models/Document');
const { extractTextFromFile } = require('../services/ocrService');

exports.requestCertificate = async (req, res) => {
  try {
    const { documentType, additionalInfo } = req.body;
    if (!documentType) return res.status(400).json({ success: false, message: 'Document type is required' });
    const doc = await Document.create({
      citizenId: req.user._id,
      documentType,
      additionalInfo,
      status: 'requested'
    });
    res.status(201).json({ success: true, data: doc, message: 'Certificate request submitted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.uploadDocument = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded or invalid file type' });

    const { documentType } = req.body;
    const extractedText = await extractTextFromFile(req.file.path, req.file.mimetype);

    // FIX: Store URL-accessible path (/uploads/filename) instead of OS path (uploads/filename)
    // OS path cannot be used by frontend to fetch the file
    const fileUrl = `/uploads/${req.file.filename}`;

    const doc = await Document.create({
      citizenId: req.user._id,
      documentType: documentType || 'other',
      filePath: fileUrl,           // FIX: was req.file.path (OS-relative, not URL)
      fileName: req.file.originalname,
      fileSize: req.file.size,
      extractedText,
      status: 'under_review'
    });

    res.status(201).json({
      success: true,
      data: doc,
      fileUrl,                    // FIX: Return accessible URL to frontend
      extractedText
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getMyDocuments = async (req, res) => {
  try {
    const docs = await Document.find({ citizenId: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, data: docs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getAllDocuments = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};
    const docs = await Document.find(filter)
      .populate('citizenId', 'name email phone')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: docs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.reviewDocument = async (req, res) => {
  try {
    const { status, rejectionReason } = req.body;
    const doc = await Document.findById(req.params.id);
    if (!doc) return res.status(404).json({ success: false, message: 'Document not found' });
    doc.status = status;
    doc.reviewedBy = req.user._id;
    if (status === 'rejected') doc.rejectionReason = rejectionReason;
    if (status === 'issued') doc.issuedAt = new Date();
    await doc.save();
    res.json({ success: true, data: doc });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.searchDocuments = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.status(400).json({ success: false, message: 'Search query required' });
    const docs = await Document.find({
      citizenId: req.user._id,
      $or: [
        { extractedText: { $regex: q, $options: 'i' } },
        { documentType: { $regex: q, $options: 'i' } }
      ]
    });
    res.json({ success: true, data: docs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
