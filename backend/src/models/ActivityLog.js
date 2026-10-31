const mongoose = require('mongoose');

const ActivityLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    userName: {
      type: String,
      default: 'System Agent',
    },
    userRole: {
      type: String,
      default: 'admin',
    },
    action: {
      type: String,
      enum: ['CREATE', 'UPDATE', 'DELETE', 'MERGE', 'STATUS_CHANGE', 'LOGIN', 'LOGOUT', 'AI_ACTION', 'RESTOCK'],
      required: true,
      index: true,
    },
    entityType: {
      type: String,
      enum: [
        'Customer',
        'Product',
        'Order',
        'Inventory',
        'Return',
        'SupportTicket',
        'Recommendation',
        'User',
        'IdentityMerge',
      ],
      required: true,
      index: true,
    },
    entityId: {
      type: String,
      default: '',
    },
    details: {
      type: String,
      required: true,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    ipAddress: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('ActivityLog', ActivityLogSchema);
