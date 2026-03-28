const mongoose = require("mongoose");

const SchemeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  ministry: { type: String },
  benefits: [{ type: String }],
  eligibilityRules: {
    maxIncome: { type: Number },
    minAge: { type: Number },
    maxAge: { type: Number },
    gender: { type: String },
    occupation: [{ type: String }],
    category: { type: String }
  },
  deadline: { type: Date },
  applicationUrl: { type: String },
  documents: [{ type: String }],
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Scheme", SchemeSchema);
