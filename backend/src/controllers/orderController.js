const Order = require('../models/Order');
const Customer = require('../models/Customer');
const Product = require('../models/Product');
const Inventory = require('../models/Inventory');
const Sale = require('../models/Sale');
const ActivityLog = require('../models/ActivityLog');

// @desc    Get all orders with filtering and pagination
// @route   GET /api/orders
// @access  Private
exports.getOrders = async (req, res) => {
  try {
    const {
      channel,
      status,
      returnRisk,
      search,
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = req.query;

    const query = {};

    if (channel && channel !== 'all') {
      query.channel = channel;
    }

    if (status && status !== 'all') {
      query.orderStatus = status;
    }

    if (returnRisk && returnRisk !== 'all') {
      query.predictedReturnRisk = returnRisk;
    }

    if (search) {
      query.$or = [
        { orderNumber: { $regex: search, $options: 'i' } },
        { unifiedCustomerId: { $regex: search, $options: 'i' } },
        { 'items.productName': { $regex: search, $options: 'i' } },
      ];
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const total = await Order.countDocuments(query);
    const orders = await Order.find(query)
      .populate('customer', 'firstName lastName email phone segment')
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      count: orders.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      data: orders,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single order by ID
// @route   GET /api/orders/:id
// @access  Private
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('customer')
      .populate('items.product');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    res.status(200).json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create new order
// @route   POST /api/orders
// @access  Private/Admin/SalesManager
exports.createOrder = async (req, res) => {
  try {
    const {
      customerId,
      channel = 'web',
      items,
      paymentMethod = 'Credit Card',
      shippingAddress,
      storeLocation,
      notes,
    } = req.body;

    const customer = await Customer.findById(customerId);
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer profile not found.' });
    }

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Order must contain at least one item.' });
    }

    let subtotal = 0;
    const orderItems = [];

    // Process and validate items & deduct inventory
    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({ success: false, message: `Product ${item.productId} not found` });
      }

      const itemTotal = Number((product.price * item.quantity).toFixed(2));
      subtotal += itemTotal;

      orderItems.push({
        product: product._id,
        productName: product.name,
        sku: product.sku,
        quantity: item.quantity,
        unitPrice: product.price,
        totalPrice: itemTotal,
      });

      // Deduct inventory
      product.stockQuantity = Math.max(0, product.stockQuantity - item.quantity);
      await product.save();

      await Inventory.findOneAndUpdate(
        { product: product._id },
        {
          $inc: { currentStock: -item.quantity, availableStock: -item.quantity },
        }
      );
    }

    const taxAmount = Number((subtotal * 0.08).toFixed(2));
    const finalAmount = Number((subtotal + taxAmount).toFixed(2));

    const count = await Order.countDocuments();
    const orderNumber = `ORD-${(10000 + count + 1).toString()}`;

    // Compute basic return risk heuristic (e.g. high apparel or first-time customer)
    let returnRiskScore = 18;
    if (orderItems.some((i) => i.productName.toLowerCase().includes('shirt') || i.productName.toLowerCase().includes('shoe'))) {
      returnRiskScore += 25;
    }
    if (customer.orderCount === 0) {
      returnRiskScore += 15;
    }
    const predictedReturnRisk = returnRiskScore > 60 ? 'High' : returnRiskScore > 35 ? 'Medium' : 'Low';

    const order = await Order.create({
      orderNumber,
      customer: customer._id,
      unifiedCustomerId: customer.unifiedCustomerId,
      channel,
      items: orderItems,
      totalAmount: subtotal,
      taxAmount,
      finalAmount,
      paymentMethod,
      orderStatus: 'Delivered',
      shippingAddress: shippingAddress || customer.address,
      storeLocation: channel === 'store' ? storeLocation || 'Downtown Flagship #104' : '',
      predictedReturnRisk,
      returnRiskScore,
      notes,
    });

    // Record sale facts for analytics
    for (const item of orderItems) {
      const prod = await Product.findById(item.product);
      await Sale.create({
        order: order._id,
        orderNumber: order.orderNumber,
        date: order.createdAt,
        channel: order.channel,
        category: prod ? prod.category : 'General',
        product: item.product,
        productName: item.productName,
        unitsSold: item.quantity,
        revenue: item.totalPrice,
        cost: prod ? prod.costPrice * item.quantity : item.totalPrice * 0.6,
        grossProfit: prod ? item.totalPrice - prod.costPrice * item.quantity : item.totalPrice * 0.4,
      });
    }

    // Update customer stats
    customer.totalSpent = Number((customer.totalSpent + finalAmount).toFixed(2));
    customer.orderCount += 1;
    customer.avgOrderValue = Number((customer.totalSpent / customer.orderCount).toFixed(2));
    customer.lastPurchaseDate = new Date();
    // Reduce churn risk because customer just made a purchase!
    customer.churnRiskScore = Math.max(5, customer.churnRiskScore - 30);
    customer.churnRiskLevel = customer.churnRiskScore > 65 ? 'High' : customer.churnRiskScore > 35 ? 'Medium' : 'Low';
    await customer.save();

    await ActivityLog.create({
      user: req.user ? req.user._id : null,
      userName: req.user ? req.user.name : 'Sales Staff',
      userRole: req.user ? req.user.role : 'sales_manager',
      action: 'CREATE',
      entityType: 'Order',
      entityId: order._id.toString(),
      details: `Created order #${order.orderNumber} ($${order.finalAmount}) for ${customer.fullName} via ${channel.toUpperCase()}`,
    });

    res.status(201).json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Admin/SalesManager
exports.updateOrderStatus = async (req, res) => {
  try {
    const { orderStatus } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    order.orderStatus = orderStatus;
    await order.save();

    res.status(200).json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
