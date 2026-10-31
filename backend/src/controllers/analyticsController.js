const Customer = require('../models/Customer');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Inventory = require('../models/Inventory');
const Return = require('../models/Return');
const SupportTicket = require('../models/SupportTicket');
const Sale = require('../models/Sale');
const ActivityLog = require('../models/ActivityLog');
const Recommendation = require('../models/Recommendation');

// @desc    Admin Global Dashboard KPIs & Trends
// @route   GET /api/analytics/admin-kpis
// @access  Private
exports.getAdminKPIs = async (req, res) => {
  try {
    // Basic counts
    const totalCustomers = await Customer.countDocuments({ isMerged: { $ne: true } });
    const totalProducts = await Product.countDocuments({ isActive: true });
    const totalOrders = await Order.countDocuments();

    // Total revenue & profit from sales
    const salesAggregate = await Sale.aggregate([
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$revenue' },
          totalProfit: { $sum: '$grossProfit' },
          totalUnitsSold: { $sum: '$unitsSold' },
        },
      },
    ]);
    const totalRevenue = salesAggregate[0]?.totalRevenue || 0;
    const totalProfit = salesAggregate[0]?.totalProfit || 0;

    // Inventory metrics
    const inventoryAggregate = await Inventory.aggregate([
      {
        $group: {
          _id: null,
          totalStock: { $sum: '$currentStock' },
          lowStockCount: {
            $sum: { $cond: [{ $eq: ['$stockStatus', 'Low Stock'] }, 1, 0] },
          },
          stockoutCount: {
            $sum: { $cond: [{ $eq: ['$stockStatus', 'Out of Stock'] }, 1, 0] },
          },
          imminentStockouts: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $ne: ['$predictedStockoutDays', null] },
                    { $lte: ['$predictedStockoutDays', 7] },
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
      },
    ]);
    const inventoryStats = inventoryAggregate[0] || {
      totalStock: 0,
      lowStockCount: 0,
      stockoutCount: 0,
      imminentStockouts: 0,
    };

    // Churn Risk count
    const highChurnCount = await Customer.countDocuments({
      churnRiskLevel: 'High',
      isMerged: { $ne: true },
    });

    // Return metrics
    const totalReturns = await Return.countDocuments();
    const returnRate = totalOrders > 0 ? Number(((totalReturns / totalOrders) * 100).toFixed(1)) : 0;

    // Cross-channel revenue breakdown
    const channelSales = await Sale.aggregate([
      {
        $group: {
          _id: '$channel',
          revenue: { $sum: '$revenue' },
          orders: { $sum: 1 },
          units: { $sum: '$unitsSold' },
        },
      },
    ]);

    // Category breakdown
    const categorySales = await Sale.aggregate([
      {
        $group: {
          _id: '$category',
          revenue: { $sum: '$revenue' },
          units: { $sum: '$unitsSold' },
        },
      },
      { $sort: { revenue: -1 } },
    ]);

    // Revenue trend (last 7 days or grouped by date)
    const revenueTrends = await Sale.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
          revenue: { $sum: '$revenue' },
          profit: { $sum: '$grossProfit' },
          orders: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      { $limit: 14 },
    ]);

    // Recent system activity
    const recentActivities = await ActivityLog.find()
      .sort({ createdAt: -1 })
      .limit(6);

    // Pending high-priority recommendations
    const topRecommendations = await Recommendation.find({
      status: { $in: ['Pending', 'In Progress'] },
    })
      .sort({ priority: 1, createdAt: -1 })
      .limit(4);

    res.status(200).json({
      success: true,
      data: {
        totalCustomers,
        totalProducts,
        totalOrders,
        totalRevenue: Number(totalRevenue.toFixed(2)),
        totalProfit: Number(totalProfit.toFixed(2)),
        currentInventory: inventoryStats.totalStock,
        lowStockProducts: inventoryStats.lowStockCount,
        predictedStockouts: inventoryStats.imminentStockouts,
        highChurnRiskCount: highChurnCount,
        returnRate,
        channelSales,
        categorySales,
        revenueTrends,
        recentActivities,
        topRecommendations,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Inventory Manager Dashboard KPIs
// @route   GET /api/analytics/inventory-kpis
// @access  Private
exports.getInventoryKPIs = async (req, res) => {
  try {
    const totalProducts = await Product.countDocuments({ isActive: true });
    const stockStats = await Inventory.aggregate([
      {
        $group: {
          _id: '$stockStatus',
          count: { $sum: 1 },
          totalUnits: { $sum: '$currentStock' },
        },
      },
    ]);

    const criticalItems = await Inventory.find({
      $or: [
        { stockStatus: { $in: ['Low Stock', 'Out of Stock'] } },
        { predictedStockoutDays: { $lte: 7, $ne: null } },
      ],
    })
      .populate('product', 'category price image')
      .sort({ predictedStockoutDays: 1, currentStock: 1 })
      .limit(8);

    const restockRecommendations = await Recommendation.find({
      category: 'Restock',
      status: 'Pending',
    }).limit(6);

    res.status(200).json({
      success: true,
      data: {
        totalProducts,
        stockStats,
        criticalItems,
        restockRecommendations,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Sales Manager Dashboard KPIs
// @route   GET /api/analytics/sales-kpis
// @access  Private
exports.getSalesKPIs = async (req, res) => {
  try {
    const channelMetrics = await Order.aggregate([
      {
        $group: {
          _id: '$channel',
          orderCount: { $sum: 1 },
          totalRevenue: { $sum: '$finalAmount' },
          avgOrderValue: { $avg: '$finalAmount' },
        },
      },
    ]);

    const topSelling = await Sale.aggregate([
      {
        $group: {
          _id: '$productName',
          unitsSold: { $sum: '$unitsSold' },
          revenue: { $sum: '$revenue' },
        },
      },
      { $sort: { revenue: -1 } },
      { $limit: 6 },
    ]);

    const returnRateByCategory = await Return.aggregate([
      {
        $lookup: {
          from: 'products',
          localField: 'product',
          foreignField: '_id',
          as: 'prod',
        },
      },
      { $unwind: '$prod' },
      {
        $group: {
          _id: '$prod.category',
          returns: { $sum: 1 },
          refundTotal: { $sum: '$refundAmount' },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: {
        channelMetrics,
        topSelling,
        returnRateByCategory,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Support Staff Dashboard KPIs
// @route   GET /api/analytics/support-kpis
// @access  Private
exports.getSupportKPIs = async (req, res) => {
  try {
    const ticketStats = await SupportTicket.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    const churnRiskTickets = await SupportTicket.find({ churnSignalTriggered: true })
      .populate('customer', 'firstName lastName email totalSpent segment churnRiskScore')
      .sort({ createdAt: -1 })
      .limit(6);

    const sentimentOverview = await SupportTicket.aggregate([
      {
        $group: {
          _id: '$sentiment',
          count: { $sum: 1 },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: {
        ticketStats,
        churnRiskTickets,
        sentimentOverview,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Business Analyst Dashboard KPIs & Predictive Reports
// @route   GET /api/analytics/analyst-kpis
// @access  Private
exports.getAnalystKPIs = async (req, res) => {
  try {
    const customerSegments = await Customer.aggregate([
      { $match: { isMerged: { $ne: true } } },
      {
        $group: {
          _id: '$segment',
          count: { $sum: 1 },
          totalSpent: { $sum: '$totalSpent' },
          avgChurnScore: { $avg: '$churnRiskScore' },
        },
      },
    ]);

    const churnDistribution = await Customer.aggregate([
      { $match: { isMerged: { $ne: true } } },
      {
        $group: {
          _id: '$churnRiskLevel',
          count: { $sum: 1 },
          avgOrderCount: { $avg: '$orderCount' },
          avgSpend: { $avg: '$totalSpent' },
        },
      },
    ]);

    const returnImpact = await Return.aggregate([
      {
        $group: {
          _id: '$reason',
          count: { $sum: 1 },
          marginLost: { $sum: '$impactOnMargin' },
        },
      },
      { $sort: { marginLost: -1 } },
    ]);

    res.status(200).json({
      success: true,
      data: {
        customerSegments,
        churnDistribution,
        returnImpact,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
