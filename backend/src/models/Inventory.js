const mongoose = require('mongoose');

const InventorySchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
      unique: true,
      index: true,
    },
    sku: {
      type: String,
      required: true,
      index: true,
    },
    productName: {
      type: String,
      required: true,
    },
    currentStock: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
      index: true,
    },
    reservedStock: {
      type: Number,
      default: 0,
      min: 0,
    },
    availableStock: {
      type: Number,
      default: 0,
      min: 0,
    },
    reorderPoint: {
      type: Number,
      default: 20,
    },
    reorderQuantity: {
      type: Number,
      default: 50,
    },
    stockStatus: {
      type: String,
      enum: ['In Stock', 'Low Stock', 'Out of Stock', 'Overstocked'],
      default: 'In Stock',
      index: true,
    },
    predictedStockoutDays: {
      type: Number,
      default: null, // e.g. 4 means stockout in 4 days
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
    supplierName: {
      type: String,
      default: 'Apex Supply Co.',
    },
    supplierLeadTime: {
      type: Number,
      default: 5, // days
    },
    warehouseLocation: {
      type: String,
      default: 'Zone A-14',
    },
    lastRestockedAt: {
      type: Date,
      default: null,
    },
    restockHistory: [
      {
        quantity: Number,
        cost: Number,
        supplier: String,
        restockedBy: String,
        restockedAt: {
          type: Date,
          default: Date.now,
        },
        notes: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Pre-save recalculation
InventorySchema.pre('save', function () {
  this.availableStock = Math.max(0, this.currentStock - (this.reservedStock || 0));
  if (this.currentStock === 0) {
    this.stockStatus = 'Out of Stock';
  } else if (this.currentStock <= this.reorderPoint) {
    this.stockStatus = 'Low Stock';
  } else if (this.currentStock > this.reorderPoint * 4) {
    this.stockStatus = 'Overstocked';
  } else {
    this.stockStatus = 'In Stock';
  }
});

module.exports = mongoose.model('Inventory', InventorySchema);
