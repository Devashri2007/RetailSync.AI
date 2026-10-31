const mongoose = require('mongoose');

const CustomerSchema = new mongoose.Schema(
  {
    unifiedCustomerId: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
      trim: true,
      index: true,
    },
    phone: {
      type: String,
      default: '',
      trim: true,
      index: true,
    },
    channel: {
      type: String,
      enum: ['web', 'mobile', 'store'],
      default: 'web',
      index: true,
    },
    segment: {
      type: String,
      enum: ['VIP', 'Loyal', 'At-Risk', 'Occasional', 'New'],
      default: 'New',
      index: true,
    },
    totalSpent: {
      type: Number,
      default: 0,
      min: 0,
    },
    orderCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    avgOrderValue: {
      type: Number,
      default: 0,
      min: 0,
    },
    lastPurchaseDate: {
      type: Date,
      default: null,
    },
    churnRiskScore: {
      type: Number,
      default: 15,
      min: 0,
      max: 100,
      index: true,
    },
    churnRiskLevel: {
      type: String,
      enum: ['Low', 'Medium', 'High'],
      default: 'Low',
      index: true,
    },
    churnFactors: [
      {
        factor: String,
        impact: String, // e.g. "+25% churn likelihood"
      },
    ],
    isMerged: {
      type: Boolean,
      default: false,
      index: true,
    },
    mergedInto: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      default: null,
    },
    mergeHistory: [
      {
        mergedCustomerId: String,
        sourceChannel: String,
        confidenceScore: Number,
        mergedAt: {
          type: Date,
          default: Date.now,
        },
        mergedBy: String,
        reason: String,
      },
    ],
    address: {
      street: { type: String, default: '' },
      city: { type: String, default: '' },
      state: { type: String, default: '' },
      zipCode: { type: String, default: '' },
      country: { type: String, default: 'USA' },
    },
    loyaltyPoints: {
      type: Number,
      default: 0,
    },
    supportTicketCount: {
      type: Number,
      default: 0,
    },
    tags: [String],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

CustomerSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});

module.exports = mongoose.model('Customer', CustomerSchema);
