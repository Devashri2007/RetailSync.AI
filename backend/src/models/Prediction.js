const mongoose = require('mongoose');

const PredictionSchema = new mongoose.Schema(
  {
    predictionType: {
      type: String,
      enum: ['demand_forecast', 'churn_risk', 'return_risk', 'product_recommendation'],
      required: true,
      index: true,
    },
    targetEntity: {
      type: String,
      enum: ['Product', 'Customer', 'Order'],
      required: true,
      index: true,
    },
    targetId: {
      type: String,
      required: true,
      index: true,
    },
    targetName: {
      type: String,
      required: true,
    },
    forecastData: {
      demand7d: Number,
      demand15d: Number,
      demand30d: Number,
      predictedStockoutDays: Number,
      recommendedRestockQty: Number,
    },
    riskScore: {
      type: Number,
      min: 0,
      max: 100,
    },
    riskLevel: {
      type: String,
      enum: ['Low', 'Medium', 'High'],
    },
    confidence: {
      type: Number,
      default: 0.88,
    },
    factors: [
      {
        factor: String,
        weight: Number,
        impact: String,
      },
    ],
    recommendations: [
      {
        productId: String,
        productName: String,
        score: Number,
        reason: String,
      },
    ],
    modelName: {
      type: String,
      default: 'RetailSync-Ensemble-v1',
    },
    modelVersion: {
      type: String,
      default: '1.0.0',
    },
    expiresAt: Date,
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Prediction', PredictionSchema);
