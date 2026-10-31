const Customer = require('../models/Customer');
const Order = require('../models/Order');
const Return = require('../models/Return');
const SupportTicket = require('../models/SupportTicket');
const ActivityLog = require('../models/ActivityLog');

// @desc    Get all customers with pagination, search, and filters
// @route   GET /api/customers
// @access  Private
exports.getCustomers = async (req, res) => {
  try {
    const {
      search,
      segment,
      channel,
      churnRiskLevel,
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      excludeMerged = 'true',
    } = req.query;

    const query = {};

    if (excludeMerged === 'true') {
      query.isMerged = { $ne: true };
    }

    if (segment && segment !== 'all') {
      query.segment = segment;
    }

    if (channel && channel !== 'all') {
      query.channel = channel;
    }

    if (churnRiskLevel && churnRiskLevel !== 'all') {
      query.churnRiskLevel = churnRiskLevel;
    }

    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { unifiedCustomerId: { $regex: search, $options: 'i' } },
      ];
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const total = await Customer.countDocuments(query);
    const customers = await Customer.find(query)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      count: customers.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      data: customers,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single customer profile with combined history
// @route   GET /api/customers/:id
// @access  Private
exports.getCustomerById = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    // Get unified customer history across all merged identities
    const customerIds = [customer._id];
    if (customer.mergeHistory && customer.mergeHistory.length > 0) {
      // Find IDs of customers merged into this profile
      const mergedCustomers = await Customer.find({ mergedInto: customer._id });
      mergedCustomers.forEach((c) => customerIds.push(c._id));
    }

    const orders = await Order.find({
      $or: [
        { customer: { $in: customerIds } },
        { unifiedCustomerId: customer.unifiedCustomerId },
      ],
    }).sort({ createdAt: -1 });

    const returns = await Return.find({
      $or: [
        { customer: { $in: customerIds } },
        { unifiedCustomerId: customer.unifiedCustomerId },
      ],
    }).sort({ createdAt: -1 });

    const tickets = await SupportTicket.find({
      $or: [
        { customer: { $in: customerIds } },
        { unifiedCustomerId: customer.unifiedCustomerId },
      ],
    }).sort({ createdAt: -1 });

    // Build timeline of events
    const timeline = [];

    orders.forEach((o) => {
      timeline.push({
        type: 'ORDER',
        id: o._id,
        title: `Placed Order #${o.orderNumber}`,
        details: `${o.items.length} items totaling $${o.finalAmount.toFixed(2)} via ${o.channel.toUpperCase()}`,
        channel: o.channel,
        date: o.createdAt,
        status: o.orderStatus,
      });
    });

    returns.forEach((r) => {
      timeline.push({
        type: 'RETURN',
        id: r._id,
        title: `Requested Return #${r.returnNumber}`,
        details: `Returned ${r.productName} due to '${r.reason}' ($${r.refundAmount})`,
        channel: r.channel,
        date: r.createdAt,
        status: r.refundStatus,
      });
    });

    tickets.forEach((t) => {
      timeline.push({
        type: 'TICKET',
        id: t._id,
        title: `Support Ticket #${t.ticketNumber}: ${t.subject}`,
        details: `Sentiment: ${t.sentiment} | Priority: ${t.priority}`,
        channel: t.channel,
        date: t.createdAt,
        status: t.status,
      });
    });

    if (customer.mergeHistory) {
      customer.mergeHistory.forEach((m) => {
        timeline.push({
          type: 'MERGE',
          title: `Identity Merged with ${m.mergedCustomerId}`,
          details: `Merged from ${m.sourceChannel} channel with ${m.confidenceScore}% confidence. Reason: ${m.reason}`,
          channel: m.sourceChannel,
          date: m.mergedAt,
          status: 'Merged',
        });
      });
    }

    timeline.sort((a, b) => new Date(b.date) - new Date(a.date));

    res.status(200).json({
      success: true,
      data: {
        customer,
        orders,
        returns,
        tickets,
        timeline,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create new customer
// @route   POST /api/customers
// @access  Private
exports.createCustomer = async (req, res) => {
  try {
    const { firstName, lastName, email, phone, channel, address, segment } = req.body;

    const count = await Customer.countDocuments();
    const unifiedCustomerId = `CUST-${(1000 + count + 1).toString()}`;

    const customer = await Customer.create({
      unifiedCustomerId,
      firstName,
      lastName,
      email,
      phone,
      channel: channel || 'web',
      address,
      segment: segment || 'New',
    });

    await ActivityLog.create({
      user: req.user._id,
      userName: req.user.name,
      userRole: req.user.role,
      action: 'CREATE',
      entityType: 'Customer',
      entityId: customer._id.toString(),
      details: `Created customer ${customer.fullName} (${customer.unifiedCustomerId})`,
    });

    res.status(201).json({ success: true, data: customer });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update customer
// @route   PUT /api/customers/:id
// @access  Private
exports.updateCustomer = async (req, res) => {
  try {
    const customer = await Customer.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    await ActivityLog.create({
      user: req.user._id,
      userName: req.user.name,
      userRole: req.user.role,
      action: 'UPDATE',
      entityType: 'Customer',
      entityId: customer._id.toString(),
      details: `Updated customer ${customer.fullName}`,
    });

    res.status(200).json({ success: true, data: customer });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete customer
// @route   DELETE /api/customers/:id
// @access  Private/Admin
exports.deleteCustomer = async (req, res) => {
  try {
    const customer = await Customer.findByIdAndDelete(req.params.id);
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    await ActivityLog.create({
      user: req.user._id,
      userName: req.user.name,
      userRole: req.user.role,
      action: 'DELETE',
      entityType: 'Customer',
      entityId: req.params.id,
      details: `Deleted customer ${customer.fullName}`,
    });

    res.status(200).json({ success: true, message: 'Customer deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
