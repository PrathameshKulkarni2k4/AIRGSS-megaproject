const router = require('express').Router();
const ctrl = require('../controllers/schemeController');
const { protect, authorize } = require('../middleware/auth');
router.get('/', ctrl.getAllSchemes);
router.get('/recommended', protect, ctrl.getRecommendedSchemes);
router.post('/', protect, authorize('admin'), ctrl.createScheme);
router.put('/:id', protect, authorize('admin'), ctrl.updateScheme);
router.delete('/:id', protect, authorize('admin'), ctrl.deleteScheme);
module.exports = router;
