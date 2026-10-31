const Return = require('../models/Return');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Customer = require('../models/Customer');
const Recommendation = require('../models/Recommendation');
const ActivityLog = require('../models/ActivityLog');

// @desc    Get all returns with filtering
// @route   GET /api/returns
// @access  Private
exports.getReturns = async (req, res) => {
  try {
    const {
      reason,
      status,
      channel,
      search,
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = req.query;

    const query = {};

    if (reason && reason !== 'all') {
      query.reason = reason;
    }

    if (status && status !== 'all') {
      query.refundStatus = status;
    }

    if (channel && channel !== 'all') {
      query.channel = channel;
    }

    if (search) {
      query.$or = [
        { returnNumber: { $regex: search, $options: 'i' } },
        { productName: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } },
        { unifiedCustomerId: { $regex: search, $options: 'i' } },
      ];
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const total = await Return.countDocuments(query);
    const returns = await Return.find(query)
      .populate('order', 'orderNumber finalAmount')
      .populate('customer', 'firstName lastName email phone')
      .populate('product', 'name sku price image category')
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      count: returns.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      data: returns,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create new return request
// @route   POST /api/returns
// @access  Private
exports.createReturn = async (req, res) => {
  try {
    const { orderId, productId, reason, reasonDetails, refundAmount, quantity = 1 } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const customer = await Customer.findById(order.customer);

    const count = await Return.countDocuments();
    const returnNumber = `RET-${(1000 + count + 1).toString()}`;

    // Estimated margin impact: refundAmount + estimated reverse logistics & restocking cost ($12)
    const impactOnMargin = Number(((Number(refundAmount) || product.price) + 12.5).toFixed(2));

    let recommendedAction = 'Review product specifications';
    if (reason === 'Sizing Issues') {
      recommendedAction = `Update sizing chart and customer fit guidelines for ${product.name}`;
    } else if (reason === 'Defective / Quality') {
      recommendedAction = `Notify QA and inspect batch supplier for ${product.name}`;
    } else if (reason === 'Item Not As Described') {
      recommendedAction = `Revise product photography and description copy for ${product.name}`;
    }

    const returnItem = await Return.create({
      returnNumber,
      order: order._id,
      product: product._id,
      productName: product.name,
      sku: product.sku,
      customer: order.customer,
      unifiedCustomerId: order.unifiedCustomerId,
      channel: order.channel,
      quantity,
      reason,
      reasonDetails: reasonDetails || '',
      refundAmount: Number(refundAmount) || product.price * quantity,
      impactOnMargin,
      refundStatus: 'Pending',
      predictedReturnRisk: product.returnRiskLevel || 'Medium',
      recommendedAction,
    });

    // Mark product return rate higher
    product.returnRate = Number((product.returnRate + 0.4).toFixed(1));
    if (product.returnRate > 8) {
      product.returnRiskLevel = 'High';
      product.returnRiskScore = Math.min(100, product.returnRiskScore + 15);

      // Create recommendation in Action Center if high return rate
      await Recommendation.create({
        title: `High Return Rate Alert: ${product.name}`,
        description: `Product return rate has surged to ${product.returnRate}%. Primary reported cause: ${reason}.`,
        category: 'Quality Remediation',
        relatedEntityType: 'Product',
        relatedEntityId: product._id.toString(),
        relatedEntityName: product.name,
        priority: 'High',
        evidence: `Cumulative returns causing $${impactOnMargin} margin erosion per incident.`,
        suggestedAction: recommendedAction,
      });
    }
    await product.save();

    await ActivityLog.create({
      user: req.user ? req.user._id : null,
      userName: req.user ? req.user.name : 'Staff',
      userRole: req.user ? req.user.role : 'sales_manager',
      action: 'CREATE',
      entityType: 'Return',
      entityId: returnItem._id.toString(),
      details: `Initiated return #${returnItem.returnNumber} for ${product.name} (${reason})`,
    });

    res.status(201).json({ success: true, data: returnItem });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update return status
// @route   PUT /api/returns/:id/status
// @access  Private
exports.updateReturnStatus = async (req, res) => {
  try {
    const { refundStatus } = req.body;
    const returnItem = await Return.findById(req.params.id);

    if (!returnItem) {
      return res.status(404).json({ success: false, message: 'Return record not found' });
    }

    returnItem.refundStatus = refundStatus;
    returnItem.reviewedBy = req.user ? req.user._id : null;
    if (refundStatus === 'Processed') {
      returnItem.processedAt = new Date();
    }
    await returnItem.save();

    res.status(200).json({ success: true, data: returnItem });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get return analytics & reason breakdown
// @route   GET /api/returns/analytics
// @access  Private
exports.getReturnAnalytics = async (req, res) => {
  try {
    const totalReturns = await Return.countDocuments();
    const marginErosion = await Return.aggregate([
      { $group: { _id: null, totalLost: { $sum: '$impactOnMargin' }, totalRefunded: { $sum: '$refundAmount' } } },
    ]);

    const reasonBreakdown = await Return.aggregate([
      { $group: { _id: '$reason', count: { $sum: 1 }, totalImpact: { $sum: '$impactOnMargin' } } },
      { $sort: { count: -1 } },
    ]);

    const channelBreakdown = await Return.aggregate([
      { $group: { _id: '$channel', count: { $sum: 1 }, totalRefunded: { $sum: '$refundAmount' } } },
    ]);

    const topReturnedProducts = await Return.aggregate([
      {
        $group: {
          _id: '$product',
          productName: { $first: '$productName' },
          sku: { $first: '$sku' },
          count: { $sum: 1 },
          reasons: { $push: '$reason' },
          totalImpact: { $sum: '$impactOnMargin' },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalReturns,
        totalMarginLost: marginErosion[0]?.totalLost || 0,
        totalRefunded: marginErosion[0]?.totalRefunded || 0,
        reasonBreakdown,
        channelBreakdown,
        topReturnedProducts,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
