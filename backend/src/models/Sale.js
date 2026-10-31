const mongoose = require('mongoose');

const SaleSchema = new mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
    },
    orderNumber: String,
    date: {
      type: Date,
      required: true,
      index: true,
    },
    channel: {
      type: String,
      enum: ['web', 'mobile', 'store'],
      required: true,
      index: true,
    },
    category: {
      type: String,
      required: true,
      index: true,
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
    },
    productName: String,
    unitsSold: {
      type: Number,
      required: true,
      min: 1,
    },
    revenue: {
      type: Number,
      required: true,
      min: 0,
    },
    cost: {
      type: Number,
      required: true,
      min: 0,
    },
    grossProfit: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Sale', SaleSchema);
