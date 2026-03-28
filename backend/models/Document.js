const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const DocumentSchema = new mongoose.Schema({
  citizenId: { type: mongoose.Schema.Types.ObjectId, ref: 'Citizen', required: true },
  documentType: {
    type: String,
    enum: ['income_certificate', 'residence_certificate', 'birth_certificate', 'caste_certificate', 'other'],
    required: true
  },
  status: {
    type: String,
    enum: ['requested', 'under_review', 'approved', 'rejected', 'issued'],
    default: 'requested'
  },
  filePath: { type: String },       // Stores URL path: /uploads/filename.pdf
  fileName: { type: String },       // FIX: Added original filename field
  fileSize: { type: Number },       // FIX: Added file size field
  extractedText: { type: String },
  verificationCode: { type: String, default: () => uuidv4().slice(0, 12).toUpperCase() },
  documentId: { type: String, default: () => 'DOC-' + uuidv4().slice(0, 8).toUpperCase() },
  rejectionReason: { type: String },
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Citizen' },
  issuedAt: { type: Date },
  additionalInfo: { type: Object },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Document', DocumentSchema);
