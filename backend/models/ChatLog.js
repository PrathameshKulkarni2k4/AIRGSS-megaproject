const mongoose = require("mongoose");

const ChatLogSchema = new mongoose.Schema({
  citizenId: { type: mongoose.Schema.Types.ObjectId, ref: "Citizen" },
  sessionId: { type: String },
  messages: [{
    role: { type: String, enum: ["user", "assistant"] },
    content: { type: String },
    timestamp: { type: Date, default: Date.now }
  }],
  language: { type: String, default: "en" },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("ChatLog", ChatLogSchema);
