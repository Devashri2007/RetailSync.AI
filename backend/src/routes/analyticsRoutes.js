const express = require('express');
const router = express.Router();
const {
  getAdminKPIs,
  getInventoryKPIs,
  getSalesKPIs,
  getSupportKPIs,
  getAnalystKPIs,
} = require('../controllers/analyticsController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/admin-kpis', getAdminKPIs);
router.get('/inventory-kpis', getInventoryKPIs);
router.get('/sales-kpis', getSalesKPIs);
router.get('/support-kpis', getSupportKPIs);
router.get('/analyst-kpis', getAnalystKPIs);

module.exports = router;
