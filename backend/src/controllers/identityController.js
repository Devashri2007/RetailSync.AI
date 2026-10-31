const Customer = require('../models/Customer');
const CustomerIdentity = require('../models/CustomerIdentity');
const Order = require('../models/Order');
const Return = require('../models/Return');
const SupportTicket = require('../models/SupportTicket');
const ActivityLog = require('../models/ActivityLog');
const Notification = require('../models/Notification');
const { evaluateCustomerMatch } = require('../services/identityEngine');

// @desc    Scan database for cross-channel duplicate customer identities
// @route   POST /api/identity/scan
// @access  Private
exports.scanDuplicates = async (req, res) => {
  try {
    const customers = await Customer.find({ isMerged: { $ne: true } });
    const duplicatePairs = [];

    for (let i = 0; i < customers.length; i++) {
      for (let j = i + 1; j < customers.length; j++) {
        const c1 = customers[i];
        const c2 = customers[j];

        const matchResult = evaluateCustomerMatch(c1, c2);

        if (matchResult.score >= 60) {
          duplicatePairs.push({
            primary: c1,
            secondary: c2,
            confidenceScore: matchResult.score,
            matchingAttributes: matchResult.matches,
          });
        }
      }
    }

    res.status(200).json({
      success: true,
      count: duplicatePairs.length,
      data: duplicatePairs,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get detected potential duplicate identities
// @route   GET /api/identity/candidates
// @access  Private
exports.getCandidates = async (req, res) => {
  try {
    const customers = await Customer.find({ isMerged: { $ne: true } });
    const candidates = [];
    const seenPairs = new Set();

    for (let i = 0; i < customers.length; i++) {
      for (let j = i + 1; j < customers.length; j++) {
        const c1 = customers[i];
        const c2 = customers[j];

        const pairKey = [c1._id.toString(), c2._id.toString()].sort().join('_');
        if (seenPairs.has(pairKey)) continue;

        const match = evaluateCustomerMatch(c1, c2);
        if (match.score >= 55) {
          seenPairs.add(pairKey);
          candidates.push({
            pairId: pairKey,
            customerA: {
              id: c1._id,
              unifiedCustomerId: c1.unifiedCustomerId,
              name: `${c1.firstName} ${c1.lastName}`,
              email: c1.email,
              phone: c1.phone,
              channel: c1.channel,
              totalSpent: c1.totalSpent,
              orderCount: c1.orderCount,
              city: c1.address?.city,
              zipCode: c1.address?.zipCode,
            },
            customerB: {
              id: c2._id,
              unifiedCustomerId: c2.unifiedCustomerId,
              name: `${c2.firstName} ${c2.lastName}`,
              email: c2.email,
              phone: c2.phone,
              channel: c2.channel,
              totalSpent: c2.totalSpent,
              orderCount: c2.orderCount,
              city: c2.address?.city,
              zipCode: c2.address?.zipCode,
            },
            confidenceScore: match.score,
            matchingAttributes: match.matches,
            status: match.score >= 90 ? 'High Confidence' : 'Review Recommended',
          });
        }
      }
    }

    candidates.sort((a, b) => b.confidenceScore - a.confidenceScore);

    res.status(200).json({
      success: true,
      count: candidates.length,
      data: candidates,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Preview merge: view combined profile and items before merging
// @route   POST /api/identity/preview-merge
// @access  Private
exports.previewMerge = async (req, res) => {
  try {
    const { primaryId, secondaryId } = req.body;

    const primary = await Customer.findById(primaryId);
    const secondary = await Customer.findById(secondaryId);

    if (!primary || !secondary) {
      return res.status(404).json({ success: false, message: 'One or both customer profiles not found.' });
    }

    const primaryOrders = await Order.find({ customer: primary._id });
    const secondaryOrders = await Order.find({ customer: secondary._id });

    const primaryTickets = await SupportTicket.find({ customer: primary._id });
    const secondaryTickets = await SupportTicket.find({ customer: secondary._id });

    const primaryReturns = await Return.find({ customer: primary._id });
    const secondaryReturns = await Return.find({ customer: secondary._id });

    const match = evaluateCustomerMatch(primary, secondary);

    const combinedSummary = {
      primary,
      secondary,
      confidenceScore: match.score,
      matchingAttributes: match.matches,
      projectedTotals: {
        totalSpent: Number((primary.totalSpent + secondary.totalSpent).toFixed(2)),
        orderCount: primary.orderCount + secondary.orderCount,
        ticketCount: (primary.supportTicketCount || primaryTickets.length) + (secondary.supportTicketCount || secondaryTickets.length),
        returnCount: primaryReturns.length + secondaryReturns.length,
      },
      orders: [...primaryOrders, ...secondaryOrders],
      tickets: [...primaryTickets, ...secondaryTickets],
      returns: [...primaryReturns, ...secondaryReturns],
    };

    res.status(200).json({
      success: true,
      data: combinedSummary,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Merge two customer profiles into one unified identity
// @route   POST /api/identity/merge
// @access  Private
exports.mergeCustomers = async (req, res) => {
  try {
    const { primaryId, secondaryId, reason = 'Cross-channel identity verification' } = req.body;

    const primary = await Customer.findById(primaryId);
    const secondary = await Customer.findById(secondaryId);

    if (!primary || !secondary) {
      return res.status(404).json({ success: false, message: 'One or both customer profiles not found.' });
    }

    if (primary._id.toString() === secondary._id.toString()) {
      return res.status(400).json({ success: false, message: 'Cannot merge a customer into itself.' });
    }

    const match = evaluateCustomerMatch(primary, secondary);

    // 1. Reassign secondary customer's orders to primary
    await Order.updateMany(
      { customer: secondary._id },
      {
        $set: {
          customer: primary._id,
          unifiedCustomerId: primary.unifiedCustomerId,
        },
      }
    );

    // 2. Reassign secondary returns to primary
    await Return.updateMany(
      { customer: secondary._id },
      {
        $set: {
          customer: primary._id,
          unifiedCustomerId: primary.unifiedCustomerId,
        },
      }
    );

    // 3. Reassign secondary support tickets to primary
    await SupportTicket.updateMany(
      { customer: secondary._id },
      {
        $set: {
          customer: primary._id,
          unifiedCustomerId: primary.unifiedCustomerId,
        },
      }
    );

    // 4. Mark secondary customer as merged
    secondary.isMerged = true;
    secondary.mergedInto = primary._id;
    await secondary.save();

    // 5. Update primary customer totals & append merge history
    primary.totalSpent = Number((primary.totalSpent + secondary.totalSpent).toFixed(2));
    primary.orderCount = primary.orderCount + secondary.orderCount;
    if (primary.orderCount > 0) {
      primary.avgOrderValue = Number((primary.totalSpent / primary.orderCount).toFixed(2));
    }

    // Keep most recent purchase date
    if (secondary.lastPurchaseDate) {
      if (!primary.lastPurchaseDate || new Date(secondary.lastPurchaseDate) > new Date(primary.lastPurchaseDate)) {
        primary.lastPurchaseDate = secondary.lastPurchaseDate;
      }
    }

    // Retain phone/address if primary was missing them
    if (!primary.phone && secondary.phone) primary.phone = secondary.phone;
    if (!primary.address?.city && secondary.address?.city) primary.address = secondary.address;

    primary.mergeHistory.push({
      mergedCustomerId: secondary.unifiedCustomerId,
      sourceChannel: secondary.channel,
      confidenceScore: match.score || 85,
      mergedAt: new Date(),
      mergedBy: req.user ? req.user.name : 'System Admin',
      reason,
    });

    await primary.save();

    // 6. Record activity log and dispatch notification
    await ActivityLog.create({
      user: req.user ? req.user._id : null,
      userName: req.user ? req.user.name : 'System Admin',
      userRole: req.user ? req.user.role : 'admin',
      action: 'MERGE',
      entityType: 'Customer',
      entityId: primary._id.toString(),
      details: `Merged ${secondary.unifiedCustomerId} (${secondary.channel.toUpperCase()}) into Unified Customer ${primary.unifiedCustomerId} (${match.score}% match)`,
    });

    await Notification.create({
      recipient: 'all',
      title: 'Customer Identity Unified',
      message: `${primary.fullName} (${primary.unifiedCustomerId}) merged with ${secondary.fullName} (${secondary.channel.toUpperCase()}) profile.`,
      type: 'system',
      priority: 'info',
      actionLink: `/customers/${primary._id}`,
    });

    res.status(200).json({
      success: true,
      message: `Successfully unified profiles under ${primary.unifiedCustomerId}`,
      data: primary,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
