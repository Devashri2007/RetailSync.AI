const express = require('express');
const router = express.Router();
const {
  getDemandForecast,
  getChurnPredictions,
  getReturnRisk,
  getRecommendationsForCustomer,
  runWhatIfSimulator,
} = require('../controllers/aiController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/demand-forecast', getDemandForecast);
router.get('/churn-risk', getChurnPredictions);
router.get('/return-risk', getReturnRisk);
router.get('/recommendations/:customerId', getRecommendationsForCustomer);
router.post('/what-if-simulate', runWhatIfSimulator);

module.exports = router;
