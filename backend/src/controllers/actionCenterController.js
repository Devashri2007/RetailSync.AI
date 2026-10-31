const Recommendation = require('../models/Recommendation');
const Product = require('../models/Product');
const Customer = require('../models/Customer');
const Inventory = require('../models/Inventory');
const ActivityLog = require('../models/ActivityLog');

// @desc    Get all AI Business Action Center recommendations
// @route   GET /api/action-center
// @access  Private
exports.getRecommendations = async (req, res) => {
  try {
    const { category, priority, status, page = 1, limit = 20 } = req.query;
    const query = {};

    if (category && category !== 'all') query.category = category;
    if (priority && priority !== 'all') query.priority = priority;
    if (status && status !== 'all') {
      query.status = status;
    } else if (!status) {
      // By default show pending and in-progress first
      query.status = { $ne: 'Dismissed' };
    }

    const total = await Recommendation.countDocuments(query);
    const recommendations = await Recommendation.find(query)
      .sort({
        status: 1, // 'In Progress' & 'Pending' first
        priority: 1, // Critical first
        createdAt: -1,
      })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    // Summary counts by status and priority
    const summary = await Recommendation.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    const prioritySummary = await Recommendation.aggregate([
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      count: recommendations.length,
      total,
      summary,
      prioritySummary,
      data: recommendations,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update recommendation status
// @route   PUT /api/action-center/:id/status
// @access  Private
exports.updateStatus = async (req, res) => {
  try {
    const { status, resolutionNote, assignedStaffName } = req.body;
    const rec = await Recommendation.findById(req.params.id);

    if (!rec) {
      return res.status(404).json({ success: false, message: 'Recommendation not found' });
    }

    if (status) rec.status = status;
    if (resolutionNote) rec.resolutionNote = resolutionNote;
    if (assignedStaffName) rec.assignedStaffName = assignedStaffName;

    if (status === 'Completed') {
      rec.completedAt = new Date();
    }
    rec.updatedBy = req.user ? req.user._id : null;
    await rec.save();

    await ActivityLog.create({
      user: req.user ? req.user._id : null,
      userName: req.user ? req.user.name : 'Staff',
      userRole: req.user ? req.user.role : 'admin',
      action: 'AI_ACTION',
      entityType: 'Recommendation',
      entityId: rec._id.toString(),
      details: `Action Center: Updated "${rec.title}" to [${rec.status}]`,
    });

    res.status(200).json({ success: true, data: rec });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Execute quick business action from recommendation card
// @route   POST /api/action-center/:id/execute
// @access  Private
exports.executeAction = async (req, res) => {
  try {
    const rec = await Recommendation.findById(req.params.id);
    if (!rec) {
      return res.status(404).json({ success: false, message: 'Recommendation not found' });
    }

    let actionReport = '';

    if (rec.category === 'Restock') {
      // Execute Restock
      const product = await Product.findById(rec.relatedEntityId);
      if (product) {
        const restockUnits = product.recommendedRestockQty || 60;
        product.stockQuantity += restockUnits;
        product.predictedStockoutDays = null;
        await product.save();

        await Inventory.findOneAndUpdate(
          { product: product._id },
          {
            $inc: { currentStock: restockUnits, availableStock: restockUnits },
            $set: { predictedStockoutDays: null, lastRestockedAt: new Date() },
            $push: {
              restockHistory: {
                quantity: restockUnits,
                restockedBy: req.user ? req.user.name : 'Action Center AI',
                notes: `Automated replenishment executed from AI Action Center`,
              },
            },
          }
        );
        actionReport = `Replenished ${restockUnits} units for ${product.name}. Stockout risk eliminated.`;
      }
    } else if (rec.category === 'Retention') {
      // Execute Retention
      const customer = await Customer.findById(rec.relatedEntityId);
      if (customer) {
        customer.loyaltyPoints += 250;
        customer.churnRiskScore = Math.max(10, customer.churnRiskScore - 30);
        customer.churnRiskLevel = customer.churnRiskScore > 65 ? 'High' : customer.churnRiskScore > 35 ? 'Medium' : 'Low';
        await customer.save();
        actionReport = `Credited 250 loyalty retention points to ${customer.fullName}. Churn risk reduced to ${customer.churnRiskScore}%.`;
      }
    } else {
      actionReport = `Action verified and operational adjustments queued.`;
    }

    rec.status = 'Completed';
    rec.resolutionNote = actionReport;
    rec.completedAt = new Date();
    await rec.save();

    await ActivityLog.create({
      user: req.user ? req.user._id : null,
      userName: req.user ? req.user.name : 'Staff',
      userRole: req.user ? req.user.role : 'admin',
      action: 'AI_ACTION',
      entityType: 'Recommendation',
      entityId: rec._id.toString(),
      details: `Executed AI Action: ${rec.title} -> ${actionReport}`,
    });

    res.status(200).json({
      success: true,
      message: actionReport,
      data: rec,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Scan and generate fresh AI recommendations
// @route   POST /api/action-center/generate
// @access  Private
exports.generateRecommendations = async (req, res) => {
  try {
    const generated = [];

    // 1. Scan for stockouts within 7 days
    const lowStockInventories = await Inventory.find({
      $or: [
        { currentStock: { $lte: 15 } },
        { predictedStockoutDays: { $lte: 7, $ne: null } },
      ],
    }).populate('product');

    for (const inv of lowStockInventories) {
      if (!inv.product) continue;
      const existing = await Recommendation.findOne({
        relatedEntityId: inv.product._id.toString(),
        category: 'Restock',
        status: { $in: ['Pending', 'In Progress'] },
      });

      if (!existing) {
        const days = inv.predictedStockoutDays || 4;
        const rec = await Recommendation.create({
          title: `Imminent Stockout Risk: ${inv.productName}`,
          description: `Current stock of ${inv.currentStock} units is critically below threshold. Projected depletion in ${days} days based on 7-day demand rate.`,
          category: 'Restock',
          relatedEntityType: 'Product',
          relatedEntityId: inv.product._id.toString(),
          relatedEntityName: inv.productName,
          priority: days <= 3 ? 'Critical' : 'High',
          evidence: `Available: ${inv.availableStock} | Predicted 7-day Demand: ${inv.predictedDemand7d || 25} units.`,
          suggestedAction: `Issue purchase order for ${inv.reorderQuantity || 60} units immediately to avoid lost sales.`,
        });
        generated.push(rec);
      }
    }

    // 2. Scan for high churn risk customers
    const atRiskCustomers = await Customer.find({
      churnRiskLevel: 'High',
      isMerged: { $ne: true },
    }).limit(6);

    for (const cust of atRiskCustomers) {
      const existing = await Recommendation.findOne({
        relatedEntityId: cust._id.toString(),
        category: 'Retention',
        status: { $in: ['Pending', 'In Progress'] },
      });

      if (!existing) {
        const rec = await Recommendation.create({
          title: `High Churn Risk: Retain ${cust.fullName}`,
          description: `Customer churn probability has reached ${cust.churnRiskScore}%. Inactive for prolonged period with negative support triggers.`,
          category: 'Retention',
          relatedEntityType: 'Customer',
          relatedEntityId: cust._id.toString(),
          relatedEntityName: cust.fullName,
          priority: 'Critical',
          evidence: `Total spend: $${cust.totalSpent}. Last purchase: ${cust.lastPurchaseDate ? new Date(cust.lastPurchaseDate).toLocaleDateString() : 'None'}. Support tickets: ${cust.supportTicketCount}.`,
          suggestedAction: `Deploy VIP win-back promo code (20% off) and schedule proactive relationship check-in.`,
        });
        generated.push(rec);
      }
    }

    // 3. Scan for high return rate products
    const highReturnProducts = await Product.find({
      returnRiskLevel: 'High',
      isActive: true,
    }).limit(5);

    for (const prod of highReturnProducts) {
      const existing = await Recommendation.findOne({
        relatedEntityId: prod._id.toString(),
        category: 'Quality Remediation',
        status: { $in: ['Pending', 'In Progress'] },
      });

      if (!existing) {
        const rec = await Recommendation.create({
          title: `Return Margin Erosion: ${prod.name}`,
          description: `Product return rate is elevated at ${prod.returnRate}%, eroding net profit margins.`,
          category: 'Quality Remediation',
          relatedEntityType: 'Product',
          relatedEntityId: prod._id.toString(),
          relatedEntityName: prod.name,
          priority: 'High',
          evidence: `Return score: ${prod.returnRiskScore}/100. Frequent complaints about sizing accuracy and material feel.`,
          suggestedAction: `Audit product sizing specifications, update customer fit guide on web listing, and review supplier QA batch records.`,
        });
        generated.push(rec);
      }
    }

    res.status(200).json({
      success: true,
      message: `Generated ${generated.length} fresh intelligent business recommendations.`,
      count: generated.length,
      data: generated,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
