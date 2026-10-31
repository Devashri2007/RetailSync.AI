const mongoose = require('mongoose');

const SupportTicketSchema = new mongoose.Schema(
  {
    ticketNumber: {
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
    customerName: {
      type: String,
      required: true,
    },
    channel: {
      type: String,
      enum: ['web', 'mobile', 'store', 'phone', 'email'],
      default: 'web',
    },
    subject: {
      type: String,
      required: [true, 'Subject is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
    },
    category: {
      type: String,
      enum: [
        'Product Complaint',
        'Delivery Delay',
        'Refund Inquiry',
        'Technical Issue',
        'Billing',
        'General Inquiry',
      ],
      default: 'Product Complaint',
      index: true,
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Urgent'],
      default: 'Medium',
      index: true,
    },
    status: {
      type: String,
      enum: ['Open', 'In Progress', 'Resolved', 'Closed'],
      default: 'Open',
      index: true,
    },
    sentiment: {
      type: String,
      enum: ['Positive', 'Neutral', 'Negative', 'Frustrated'],
      default: 'Neutral',
      index: true,
    },
    sentimentScore: {
      type: Number,
      default: 0.0, // -1.0 (frustrated) to +1.0 (delighted)
    },
    churnSignalTriggered: {
      type: Boolean,
      default: false,
      index: true,
    },
    churnRiskLevel: {
      type: String,
      enum: ['Low', 'Medium', 'High'],
      default: 'Low',
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    assignedStaffName: {
      type: String,
      default: 'Unassigned',
    },
    resolutionNotes: {
      type: String,
      default: '',
    },
    resolvedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('SupportTicket', SupportTicketSchema);
