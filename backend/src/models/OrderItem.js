const mongoose = require('mongoose');

const OrderItemSchema = new mongoose.Schema(
  {
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
    },
    productName: {
      type: String,
      required: true,
    },
    sku: {
      type: String,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    unitPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    unitCost: {
      type: Number,
      default: 0,
    },
    totalPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    returned: {
      type: Boolean,
      default: false,
      index: true,
    },
    returnReason: {
      type: String,
      default: null,
    },
    returnRequestedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('OrderItem', OrderItemSchema);
