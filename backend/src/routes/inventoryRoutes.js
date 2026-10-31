const express = require('express');
const router = express.Router();
const {
  getInventory,
  restockProduct,
  getStockAlerts,
  updateInventory,
} = require('../controllers/inventoryController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.get('/', getInventory);
router.get('/alerts', getStockAlerts);
router.post('/:id/restock', authorize('admin', 'inventory_manager'), restockProduct);
router.put('/:id', authorize('admin', 'inventory_manager'), updateInventory);

module.exports = router;
