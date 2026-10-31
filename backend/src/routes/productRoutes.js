const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} = require('../controllers/productController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router
  .route('/')
  .get(getProducts)
  .post(authorize('admin', 'inventory_manager'), createProduct);

router
  .route('/:id')
  .get(getProductById)
  .put(authorize('admin', 'inventory_manager'), updateProduct)
  .delete(authorize('admin'), deleteProduct);

module.exports = router;
