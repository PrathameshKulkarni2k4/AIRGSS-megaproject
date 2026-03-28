const router = require('express').Router();
const ctrl = require('../controllers/chatbotController');
const { protect } = require('../middleware/auth');
router.post('/chat', ctrl.chat);
router.get('/history/:sessionId', protect, ctrl.getChatHistory);
module.exports = router;
