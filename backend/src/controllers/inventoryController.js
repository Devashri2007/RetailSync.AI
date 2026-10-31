const Inventory = require('../models/Inventory');
const Product = require('../models/Product');
const ActivityLog = require('../models/ActivityLog');
const Notification = require('../models/Notification');
const Recommendation = require('../models/Recommendation');

// @desc    Get inventory items with filters and stock status
// @route   GET /api/inventory
// @access  Private
exports.getInventory = async (req, res) => {
  try {
    const { status, search, page = 1, limit = 25 } = req.query;
    const query = {};

    if (status && status !== 'all') {
      query.stockStatus = status;
    }

    if (search) {
      query.$or = [
        { productName: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } },
        { supplierName: { $regex: search, $options: 'i' } },
      ];
    }

    const total = await Inventory.countDocuments(query);
    const items = await Inventory.find(query)
      .populate('product', 'category price costPrice image')
      .sort({ currentStock: 1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      count: items.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      data: items,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Restock a product
// @route   POST /api/inventory/:id/restock
// @access  Private/Admin/InventoryManager
exports.restockProduct = async (req, res) => {
  try {
    const { quantity, cost, supplier, notes } = req.body;
    const restockQty = Number(quantity);

    if (!restockQty || restockQty <= 0) {
      return res.status(400).json({ success: false, message: 'Please provide a valid restock quantity.' });
    }

    const inventory = await Inventory.findById(req.params.id);
    if (!inventory) {
      return res.status(404).json({ success: false, message: 'Inventory record not found.' });
    }

    inventory.currentStock += restockQty;
    inventory.availableStock += restockQty;
    inventory.lastRestockedAt = new Date();
    inventory.restockHistory.push({
      quantity: restockQty,
      cost: cost ? Number(cost) : undefined,
      supplier: supplier || inventory.supplierName,
      restockedBy: req.user ? req.user.name : 'Staff',
      notes: notes || 'Standard restocking replenishment',
    });

    // Reset stockout warning if stock is replenished
    if (inventory.currentStock > inventory.reorderPoint) {
      inventory.predictedStockoutDays = null;
    }

    await inventory.save();

    // Update Product stock quantity
    await Product.findByIdAndUpdate(inventory.product, {
      stockQuantity: inventory.currentStock,
    });

    // Auto-resolve any pending restock recommendation for this product
    await Recommendation.updateMany(
      {
        relatedEntityId: inventory.product.toString(),
        category: 'Restock',
        status: 'Pending',
      },
      {
        status: 'Completed',
        resolutionNote: `Restocked with ${restockQty} units by ${req.user ? req.user.name : 'Staff'}`,
        completedAt: new Date(),
      }
    );

    await ActivityLog.create({
      user: req.user ? req.user._id : null,
      userName: req.user ? req.user.name : 'Staff',
      userRole: req.user ? req.user.role : 'inventory_manager',
      action: 'RESTOCK',
      entityType: 'Inventory',
      entityId: inventory._id.toString(),
      details: `Restocked ${restockQty} units of ${inventory.productName} (SKU: ${inventory.sku}). New stock: ${inventory.currentStock}`,
    });

    res.status(200).json({
      success: true,
      message: `Successfully restocked ${restockQty} units.`,
      data: inventory,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get low stock and predicted stockout alerts
// @route   GET /api/inventory/alerts
// @access  Private
exports.getStockAlerts = async (req, res) => {
  try {
    const lowStockItems = await Inventory.find({
      $or: [
        { stockStatus: { $in: ['Low Stock', 'Out of Stock'] } },
        { predictedStockoutDays: { $lte: 7, $ne: null } },
      ],
    })
      .populate('product', 'category price image')
      .sort({ predictedStockoutDays: 1, currentStock: 1 });

    res.status(200).json({
      success: true,
      count: lowStockItems.length,
      data: lowStockItems,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update inventory reorder thresholds
// @route   PUT /api/inventory/:id
// @access  Private/Admin/InventoryManager
exports.updateInventory = async (req, res) => {
  try {
    const { reorderPoint, reorderQuantity, warehouseLocation, supplierLeadTime } = req.body;

    const inventory = await Inventory.findById(req.params.id);
    if (!inventory) {
      return res.status(404).json({ success: false, message: 'Inventory record not found.' });
    }

    if (reorderPoint !== undefined) inventory.reorderPoint = Number(reorderPoint);
    if (reorderQuantity !== undefined) inventory.reorderQuantity = Number(reorderQuantity);
    if (warehouseLocation) inventory.warehouseLocation = warehouseLocation;
    if (supplierLeadTime !== undefined) inventory.supplierLeadTime = Number(supplierLeadTime);

    await inventory.save();

    res.status(200).json({ success: true, data: inventory });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
