const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const PaymentSchema = new mongoose.Schema({
  citizenId: { type: mongoose.Schema.Types.ObjectId, ref: "Citizen", required: true },
  transactionId: { type: String, default: () => "TXN-" + uuidv4().slice(0,12).toUpperCase() },
  amount: { type: Number, required: true },
  type: { type: String, enum: ["property_tax", "water_bill", "local_fee", "other"], required: true },
  status: { type: String, enum: ["pending", "success", "failed", "refunded"], default: "pending" },
  description: { type: String },
  receiptNumber: { type: String },
  dueDate: { type: Date },
  paidDate: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Payment", PaymentSchema);
