const router = require('express').Router();
const Fund = require('../models/Fund');
const { protect } = require('../middleware/auth');
router.get('/', async (req, res) => {
  try {
    const funds = await Fund.find({ status: { $ne: 'suspended' } });
    res.json({ success: true, data: funds });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});
module.exports = router;
