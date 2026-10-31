const mongoose = require('mongoose');

const ReturnSchema = new mongoose.Schema(
  {
    returnNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
      index: true,
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
      index: true,
    },
    productName: {
      type: String,
      required: true,
    },
    sku: {
      type: String,
      required: true,
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      required: true,
      index: true,
    },
    unifiedCustomerId: {
      type: String,
      required: true,
      index: true,
    },
    channel: {
      type: String,
      enum: ['web', 'mobile', 'store'],
      required: true,
    },
    quantity: {
      type: Number,
      default: 1,
      min: 1,
    },
    reason: {
      type: String,
      enum: [
        'Sizing Issues',
        'Defective / Quality',
        'Item Not As Described',
        'Changed Mind',
        'Late Delivery',
        'Wrong Item Shipped',
      ],
      required: true,
      index: true,
    },
    reasonDetails: {
      type: String,
      default: '',
    },
    refundAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    impactOnMargin: {
      type: Number,
      default: 0, // margin profit lost including reverse logistics
    },
    refundStatus: {
      type: String,
      enum: ['Pending', 'Approved', 'Processed', 'Rejected'],
      default: 'Pending',
      index: true,
    },
    predictedReturnRisk: {
      type: String,
      enum: ['Low', 'Medium', 'High'],
      default: 'Medium',
    },
    recommendedAction: {
      type: String,
      default: 'Review product return patterns',
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    processedAt: Date,
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Return', ReturnSchema);
