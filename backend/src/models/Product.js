const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema(
  {
    sku: {
      type: String,
      required: [true, 'SKU is required'],
      unique: true,
      trim: true,
      uppercase: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      index: true,
    },
    description: {
      type: String,
      default: '',
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: [
        'Electronics',
        'Apparel',
        'Home & Living',
        'Footwear',
        'Beauty',
        'Accessories',
        'Sports & Outdoors',
      ],
      index: true,
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price must be positive'],
    },
    costPrice: {
      type: Number,
      required: [true, 'Cost price is required'],
      min: [0, 'Cost price must be positive'],
    },
    stockQuantity: {
      type: Number,
      required: [true, 'Stock quantity is required'],
      min: [0, 'Stock cannot be negative'],
      default: 0,
      index: true,
    },
    lowStockThreshold: {
      type: Number,
      default: 15,
    },
    image: {
      type: String,
      default: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80',
    },
    supplier: {
      name: { type: String, default: 'Apex Retail Supply Co.' },
      contact: { type: String, default: 'supplier@apexsupply.com' },
      leadTimeDays: { type: Number, default: 5 },
    },
    returnRate: {
      type: Number,
      default: 3.2,
      min: 0,
      max: 100,
    },
    returnRiskScore: {
      type: Number,
      default: 20,
      min: 0,
      max: 100,
    },
    returnRiskLevel: {
      type: String,
      enum: ['Low', 'Medium', 'High'],
      default: 'Low',
    },
    predictedDemand7d: {
      type: Number,
      default: 0,
    },
    predictedDemand15d: {
      type: Number,
      default: 0,
    },
    predictedDemand30d: {
      type: Number,
      default: 0,
    },
    recommendedRestockQty: {
      type: Number,
      default: 0,
    },
    predictedStockoutDays: {
      type: Number,
      default: null, // null if no stockout predicted within 30 days
    },
    tags: [String],
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Virtual for profit margin
ProductSchema.virtual('profitMargin').get(function () {
  if (!this.price || !this.costPrice) return 0;
  return Number((((this.price - this.costPrice) / this.price) * 100).toFixed(1));
});

module.exports = mongoose.model('Product', ProductSchema);
