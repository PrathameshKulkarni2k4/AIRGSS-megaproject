const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const ComplaintSchema = new mongoose.Schema({
  ticketId: { type: String, default: () => "TKT-" + uuidv4().slice(0,8).toUpperCase(), unique: true },
  citizenId: { type: mongoose.Schema.Types.ObjectId, ref: "Citizen", required: true },
  category: { type: String, enum: ["roads", "water", "electricity", "sanitation", "health", "education", "corruption", "other"], required: true },
  priority: { type: String, enum: ["low", "medium", "high", "critical"], default: "medium" },
  description: { type: String, required: true },
  status: { type: String, enum: ["received", "in_review", "in_progress", "resolved", "rejected"], default: "received" },
  assignedDepartment: { type: String },
  assignedOfficer: { type: mongoose.Schema.Types.ObjectId, ref: "Citizen" },
  location: { type: String },
  attachments: [{ type: String }],
  comments: [{ text: String, by: { type: mongoose.Schema.Types.ObjectId, ref: "Citizen" }, at: { type: Date, default: Date.now } }],
  resolvedAt: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Complaint", ComplaintSchema);
