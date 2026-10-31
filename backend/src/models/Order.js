const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
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
      index: true,
    },
    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
          required: true,
        },
        productName: String,
        sku: String,
        quantity: { type: Number, required: true },
        unitPrice: { type: Number, required: true },
        totalPrice: { type: Number, required: true },
        returned: { type: Boolean, default: false },
        returnReason: String,
      },
    ],
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    discountAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    taxAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    finalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    paymentMethod: {
      type: String,
      enum: ['Credit Card', 'Debit Card', 'UPI', 'Cash', 'Store Credit', 'Net Banking'],
      default: 'Credit Card',
    },
    paymentStatus: {
      type: String,
      enum: ['Paid', 'Pending', 'Refunded', 'Partially Refunded'],
      default: 'Paid',
    },
    orderStatus: {
      type: String,
      enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Returned'],
      default: 'Delivered',
      index: true,
    },
    shippingAddress: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String,
    },
    storeLocation: {
      type: String,
      default: '', // e.g. "Downtown Flagship #104"
    },
    predictedReturnRisk: {
      type: String,
      enum: ['Low', 'Medium', 'High'],
      default: 'Low',
      index: true,
    },
    returnRiskScore: {
      type: Number,
      default: 15,
      min: 0,
      max: 100,
    },
    notes: String,
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Order', OrderSchema);
