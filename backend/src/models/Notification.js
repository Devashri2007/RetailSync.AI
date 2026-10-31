const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: String, // User ID or 'all' or 'role:inventory_manager'
      default: 'all',
      index: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['stockout_alert', 'churn_alert', 'return_alert', 'system', 'order_alert'],
      default: 'system',
      index: true,
    },
    priority: {
      type: String,
      enum: ['critical', 'warning', 'info'],
      default: 'info',
      index: true,
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
    actionLink: {
      type: String,
      default: '',
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Notification', NotificationSchema);
