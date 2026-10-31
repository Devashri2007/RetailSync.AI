const express = require('express');
const router = express.Router();
const {
  getReturns,
  createReturn,
  updateReturnStatus,
  getReturnAnalytics,
} = require('../controllers/returnController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.route('/').get(getReturns).post(createReturn);
router.route('/analytics').get(getReturnAnalytics);
router.route('/:id/status').put(authorize('admin', 'sales_manager', 'support_staff'), updateReturnStatus);

module.exports = router;
