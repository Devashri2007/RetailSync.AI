const express = require('express');
const router = express.Router();
const {
  getOrders,
  getOrderById,
  createOrder,
  updateOrderStatus,
} = require('../controllers/orderController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router
  .route('/')
  .get(getOrders)
  .post(authorize('admin', 'sales_manager', 'support_staff'), createOrder);

router.route('/:id').get(getOrderById);
router.route('/:id/status').put(authorize('admin', 'sales_manager'), updateOrderStatus);

module.exports = router;
