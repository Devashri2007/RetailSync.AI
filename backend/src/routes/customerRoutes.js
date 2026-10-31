const express = require('express');
const router = express.Router();
const {
  getCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
} = require('../controllers/customerController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router
  .route('/')
  .get(getCustomers)
  .post(authorize('admin', 'sales_manager', 'support_staff'), createCustomer);

router
  .route('/:id')
  .get(getCustomerById)
  .put(authorize('admin', 'sales_manager', 'support_staff'), updateCustomer)
  .delete(authorize('admin'), deleteCustomer);

module.exports = router;
