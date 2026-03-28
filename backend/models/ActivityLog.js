const mongoose = require("mongoose");

const ActivityLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "Citizen" },
  action: { type: String, required: true },
  resource: { type: String },
  resourceId: { type: String },
  details: { type: Object },
  ipAddress: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("ActivityLog", ActivityLogSchema);
