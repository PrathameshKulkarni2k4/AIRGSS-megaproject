const mongoose = require("mongoose");

const FundSchema = new mongoose.Schema({
  projectName: { type: String, required: true },
  description: { type: String },
  budget: { type: Number, required: true },
  spentAmount: { type: Number, default: 0 },
  status: { type: String, enum: ["planned", "ongoing", "completed", "suspended"], default: "planned" },
  category: { type: String },
  location: { type: String },
  startDate: { type: Date },
  endDate: { type: Date },
  managedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Citizen" },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Fund", FundSchema);
