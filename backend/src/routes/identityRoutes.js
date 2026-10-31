const express = require('express');
const router = express.Router();
const {
  scanDuplicates,
  getCandidates,
  previewMerge,
  mergeCustomers,
} = require('../controllers/identityController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.post('/scan', scanDuplicates);
router.get('/candidates', getCandidates);
router.post('/preview-merge', previewMerge);
router.post('/merge', authorize('admin', 'sales_manager'), mergeCustomers);

module.exports = router;
