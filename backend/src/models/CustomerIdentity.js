const mongoose = require('mongoose');

const CustomerIdentitySchema = new mongoose.Schema(
  {
    customerId: {
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
    channelIdentifier: {
      type: String, // e.g. WEB_USR_8829, MOB_DEV_9918, STORE_LOYALTY_331
      required: true,
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    name: {
      type: String,
      trim: true,
    },
    potentialDuplicates: [
      {
        candidateCustomerId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Customer',
        },
        candidateUnifiedId: String,
        candidateName: String,
        candidateEmail: String,
        candidatePhone: String,
        candidateChannel: String,
        similarityScore: {
          type: Number,
          min: 0,
          max: 100,
        },
        matchingAttributes: [String], // e.g. ['exact_phone', 'fuzzy_name:92%']
        status: {
          type: String,
          enum: ['pending', 'merged', 'dismissed'],
          default: 'pending',
        },
        detectedAt: {
          type: Date,
          default: Date.now,
        },
        reviewedAt: Date,
        reviewedBy: String,
      },
    ],
    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('CustomerIdentity', CustomerIdentitySchema);
