const Payment = require('../models/Payment');
const { v4: uuidv4 } = require('uuid');

exports.createPayment = async (req, res) => {
  try {
    const { amount, type, description, dueDate } = req.body;
    if (!amount || !type) return res.status(400).json({ success: false, message: 'Amount and type required' });
    
    const payment = await Payment.create({
      citizenId: req.user._id,
      amount, type, description, dueDate,
      status: 'pending'
    });
    res.status(201).json({ success: true, data: payment });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.processPayment = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);
    if (!payment) return res.status(404).json({ success: false, message: 'Payment not found' });
    if (payment.citizenId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    
    // Mock payment gateway - 90% success rate
    const success = Math.random() > 0.1;
    if (success) {
      payment.status = 'success';
      payment.paidDate = new Date();
      payment.receiptNumber = 'RCP-' + uuidv4().slice(0, 8).toUpperCase();
    } else {
      payment.status = 'failed';
    }
    await payment.save();
    
    if (!success) return res.status(402).json({ success: false, message: 'Payment failed. Please retry.', data: payment });
    res.json({ success: true, message: 'Payment successful', data: payment });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getMyPayments = async (req, res) => {
  try {
    const payments = await Payment.find({ citizenId: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, data: payments });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getPaymentById = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id).populate('citizenId', 'name email');
    if (!payment) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: payment });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getAllPayments = async (req, res) => {
  try {
    const payments = await Payment.find().populate('citizenId', 'name email').sort({ createdAt: -1 });
    res.json({ success: true, data: payments });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
