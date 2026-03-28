const router = require('express').Router();
const Citizen = require('../models/Citizen');
const { protect, authorize } = require('../middleware/auth');
router.use(protect);
router.get('/officers', authorize('admin'), async (req, res) => {
  try {
    const officers = await Citizen.find({ role: 'officer' }).select('-password');
    res.json({ success: true, data: officers });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});
module.exports = router;
