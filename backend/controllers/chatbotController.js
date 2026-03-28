const ChatLog = require('../models/ChatLog');
const { getChatbotResponse } = require('../services/chatbotService');
const { v4: uuidv4 } = require('uuid');

exports.chat = async (req, res) => {
  try {
    const { message, sessionId, language = 'en' } = req.body;
    if (!message || message.trim() === '') {
      return res.status(400).json({ success: false, message: 'Message cannot be empty' });
    }
    const sid = sessionId || uuidv4();
    let chatLog = await ChatLog.findOne({ sessionId: sid });
    if (!chatLog) {
      chatLog = await ChatLog.create({
        citizenId: req.user?._id,
        sessionId: sid,
        messages: [],
        language
      });
    }
    chatLog.messages.push({ role: 'user', content: message });
    const history = chatLog.messages.slice(-10).map(m => ({ role: m.role, content: m.content }));
    const response = await getChatbotResponse(message, history, language, req.user);
    chatLog.messages.push({ role: 'assistant', content: response });
    await chatLog.save();
    res.json({ success: true, data: { response, sessionId: sid } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getChatHistory = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const chatLog = await ChatLog.findOne({ sessionId });
    if (!chatLog) return res.status(404).json({ success: false, message: 'Chat session not found' });
    res.json({ success: true, data: chatLog });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
