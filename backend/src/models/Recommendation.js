const mongoose = require('mongoose');

const RecommendationSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: ['Restock', 'Retention', 'Quality Remediation', 'Promotion', 'Cross-Sell'],
      required: true,
      index: true,
    },
    relatedEntityType: {
      type: String,
      enum: ['Product', 'Customer', 'Category', 'Order'],
      required: true,
    },
    relatedEntityId: {
      type: String,
      required: true,
      index: true,
    },
    relatedEntityName: {
      type: String,
      required: true,
    },
    priority: {
      type: String,
      enum: ['Critical', 'High', 'Medium', 'Low'],
      default: 'Medium',
      index: true,
    },
    evidence: {
      type: String,
      required: true,
    },
    suggestedAction: {
      type: String,
      required: true,
    },
    actionPayload: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    status: {
      type: String,
      enum: ['Pending', 'In Progress', 'Completed', 'Dismissed'],
      default: 'Pending',
      index: true,
    },
    resolutionNote: {
      type: String,
      default: '',
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    assignedStaffName: {
      type: String,
      default: 'Unassigned',
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    completedAt: Date,
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Recommendation', RecommendationSchema);
