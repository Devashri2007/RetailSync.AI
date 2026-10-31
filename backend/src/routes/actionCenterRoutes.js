const express = require('express');
const router = express.Router();
const {
  getRecommendations,
  updateStatus,
  executeAction,
  generateRecommendations,
} = require('../controllers/actionCenterController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', getRecommendations);
router.post('/generate', generateRecommendations);
router.put('/:id/status', updateStatus);
router.post('/:id/execute', executeAction);

module.exports = router;
