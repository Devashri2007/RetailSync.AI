const Product = require('../models/Product');
const Inventory = require('../models/Inventory');
const ActivityLog = require('../models/ActivityLog');

// @desc    Get all products with filters
// @route   GET /api/products
// @access  Private
exports.getProducts = async (req, res) => {
  try {
    const {
      search,
      category,
      lowStock,
      returnRiskLevel,
      page = 1,
      limit = 20,
      sortBy = 'name',
      sortOrder = 'asc',
    } = req.query;

    const query = { isActive: true };

    if (category && category !== 'all') {
      query.category = category;
    }

    if (returnRiskLevel && returnRiskLevel !== 'all') {
      query.returnRiskLevel = returnRiskLevel;
    }

    if (lowStock === 'true') {
      query.$expr = { $lte: ['$stockQuantity', '$lowStockThreshold'] };
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
      ];
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      count: products.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      data: products,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Private
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const inventory = await Inventory.findOne({ product: product._id });

    res.status(200).json({
      success: true,
      data: {
        product,
        inventory,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create product
// @route   POST /api/products
// @access  Private/Admin/InventoryManager
exports.createProduct = async (req, res) => {
  try {
    const {
      sku,
      name,
      description,
      category,
      price,
      costPrice,
      stockQuantity,
      lowStockThreshold,
      image,
      supplier,
    } = req.body;

    const existing = await Product.findOne({ sku: sku.toUpperCase() });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Product SKU already exists' });
    }

    const product = await Product.create({
      sku: sku.toUpperCase(),
      name,
      description,
      category,
      price: Number(price),
      costPrice: Number(costPrice),
      stockQuantity: Number(stockQuantity) || 0,
      lowStockThreshold: Number(lowStockThreshold) || 15,
      image: image || undefined,
      supplier: supplier || undefined,
    });

    // Create corresponding inventory entry
    await Inventory.create({
      product: product._id,
      sku: product.sku,
      productName: product.name,
      currentStock: product.stockQuantity,
      availableStock: product.stockQuantity,
      reorderPoint: product.lowStockThreshold,
      supplierName: supplier?.name || 'Apex Retail Supply Co.',
      supplierLeadTime: supplier?.leadTimeDays || 5,
    });

    await ActivityLog.create({
      user: req.user._id,
      userName: req.user.name,
      userRole: req.user.role,
      action: 'CREATE',
      entityType: 'Product',
      entityId: product._id.toString(),
      details: `Created product ${product.name} (SKU: ${product.sku}) with ${product.stockQuantity} initial units`,
    });

    res.status(201).json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private/Admin/InventoryManager
exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Sync inventory record stock quantity if updated
    if (req.body.stockQuantity !== undefined) {
      await Inventory.findOneAndUpdate(
        { product: product._id },
        {
          currentStock: product.stockQuantity,
          availableStock: product.stockQuantity,
        }
      );
    }

    await ActivityLog.create({
      user: req.user._id,
      userName: req.user.name,
      userRole: req.user.role,
      action: 'UPDATE',
      entityType: 'Product',
      entityId: product._id.toString(),
      details: `Updated product details for ${product.name}`,
    });

    res.status(200).json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete product (soft delete)
// @route   DELETE /api/products/:id
// @access  Private/Admin
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    await ActivityLog.create({
      user: req.user._id,
      userName: req.user.name,
      userRole: req.user.role,
      action: 'DELETE',
      entityType: 'Product',
      entityId: product._id.toString(),
      details: `Deactivated product ${product.name}`,
    });

    res.status(200).json({ success: true, message: 'Product deactivated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
