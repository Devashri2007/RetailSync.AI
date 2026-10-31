const SupportTicket = require('../models/SupportTicket');
const Customer = require('../models/Customer');
const Recommendation = require('../models/Recommendation');
const Notification = require('../models/Notification');
const ActivityLog = require('../models/ActivityLog');

// Analyze text sentiment basic heuristic
function evaluateSentiment(text = '') {
  const lower = text.toLowerCase();
  const frustratedKeywords = [
    'terrible', 'worst', 'horrible', 'furious', 'unacceptable', 'cancel',
    'never again', 'rip off', 'broken', 'scam', 'lawsuit', 'disgusted', 'anger'
  ];
  const negativeKeywords = [
    'delayed', 'disappointed', 'wrong', 'missing', 'damaged', 'poor', 'bad',
    'slow', 'annoyed', 'wait', 'issue', 'complaint', 'problem', 'refund'
  ];
  const positiveKeywords = [
    'great', 'love', 'helpful', 'thank', 'excellent', 'fast', 'awesome', 'appreciated'
  ];

  let frustCount = 0;
  frustratedKeywords.forEach((k) => {
    if (lower.includes(k)) frustCount += 1;
  });

  let negCount = 0;
  negativeKeywords.forEach((k) => {
    if (lower.includes(k)) negCount += 1;
  });

  let posCount = 0;
  positiveKeywords.forEach((k) => {
    if (lower.includes(k)) posCount += 1;
  });

  if (frustCount >= 1 || negCount >= 3) {
    return { sentiment: 'Frustrated', score: -0.85 };
  }
  if (negCount > posCount) {
    return { sentiment: 'Negative', score: -0.45 };
  }
  if (posCount > negCount) {
    return { sentiment: 'Positive', score: 0.75 };
  }
  return { sentiment: 'Neutral', score: 0.0 };
}

// @desc    Get support tickets with filtering
// @route   GET /api/tickets
// @access  Private
exports.getTickets = async (req, res) => {
  try {
    const {
      status,
      priority,
      category,
      sentiment,
      churnSignal,
      search,
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = req.query;

    const query = {};

    if (status && status !== 'all') query.status = status;
    if (priority && priority !== 'all') query.priority = priority;
    if (category && category !== 'all') query.category = category;
    if (sentiment && sentiment !== 'all') query.sentiment = sentiment;
    if (churnSignal === 'true') query.churnSignalTriggered = true;

    if (search) {
      query.$or = [
        { ticketNumber: { $regex: search, $options: 'i' } },
        { subject: { $regex: search, $options: 'i' } },
        { customerName: { $regex: search, $options: 'i' } },
        { unifiedCustomerId: { $regex: search, $options: 'i' } },
      ];
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const total = await SupportTicket.countDocuments(query);
    const tickets = await SupportTicket.find(query)
      .populate('customer', 'email phone segment churnRiskScore churnRiskLevel totalSpent')
      .populate('assignedTo', 'name email')
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      count: tickets.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      data: tickets,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single ticket
// @route   GET /api/tickets/:id
// @access  Private
exports.getTicketById = async (req, res) => {
  try {
    const ticket = await SupportTicket.findById(req.params.id)
      .populate('customer')
      .populate('assignedTo', 'name email');

    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }

    res.status(200).json({ success: true, data: ticket });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create new support ticket
// @route   POST /api/tickets
// @access  Private
exports.createTicket = async (req, res) => {
  try {
    const {
      customerId,
      subject,
      description,
      category = 'Product Complaint',
      priority = 'Medium',
      channel = 'web',
    } = req.body;

    const customer = await Customer.findById(customerId);
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    const count = await SupportTicket.countDocuments();
    const ticketNumber = `TCK-${(2000 + count + 1).toString()}`;

    // Analyze Sentiment
    const sentimentAnalysis = evaluateSentiment(`${subject} ${description}`);

    // Check churn risk trigger: Frustrated/Negative sentiment + VIP/Loyal segment or inactive > 30 days
    let churnSignalTriggered = false;
    let churnRiskLevel = 'Low';

    if (sentimentAnalysis.sentiment === 'Frustrated' || sentimentAnalysis.sentiment === 'Negative') {
      churnSignalTriggered = true;
      // Escalate customer churn risk score
      customer.churnRiskScore = Math.min(100, customer.churnRiskScore + 25);
      customer.churnRiskLevel = customer.churnRiskScore >= 65 ? 'High' : 'Medium';
      churnRiskLevel = customer.churnRiskLevel;

      // Add factor to customer
      customer.churnFactors.push({
        factor: `Escalated Complaint (#${ticketNumber}): ${sentimentAnalysis.sentiment} sentiment`,
        impact: '+25% Churn Likelihood',
      });
      await customer.save();

      // Trigger AI Action Center Recommendation if churn risk is High
      if (customer.churnRiskLevel === 'High') {
        await Recommendation.create({
          title: `High Churn Risk: Retain ${customer.fullName}`,
          description: `Customer submitted a frustrated ticket regarding "${subject}". Churn risk reached ${customer.churnRiskScore}%. Lifetime Value: $${customer.totalSpent}.`,
          category: 'Retention',
          relatedEntityType: 'Customer',
          relatedEntityId: customer._id.toString(),
          relatedEntityName: customer.fullName,
          priority: 'Critical',
          evidence: `Sentiment scored ${sentimentAnalysis.score}. Complaint: "${description.slice(0, 100)}..."`,
          suggestedAction: `Dispatch personalized retention offer (15% loyalty credit) and assign senior support lead for immediate follow-up.`,
        });

        await Notification.create({
          recipient: 'all',
          title: 'High Customer Churn Risk Alert',
          message: `${customer.fullName} flagged with High Churn Risk following Ticket #${ticketNumber}.`,
          type: 'churn_alert',
          priority: 'critical',
          actionLink: `/customers/${customer._id}`,
        });
      }
    }

    customer.supportTicketCount = (customer.supportTicketCount || 0) + 1;
    await customer.save();

    const ticket = await SupportTicket.create({
      ticketNumber,
      customer: customer._id,
      unifiedCustomerId: customer.unifiedCustomerId,
      customerName: customer.fullName,
      channel,
      subject,
      description,
      category,
      priority,
      sentiment: sentimentAnalysis.sentiment,
      sentimentScore: sentimentAnalysis.score,
      churnSignalTriggered,
      churnRiskLevel,
      assignedStaffName: req.user ? req.user.name : 'Unassigned',
      assignedTo: req.user ? req.user._id : null,
    });

    await ActivityLog.create({
      user: req.user ? req.user._id : null,
      userName: req.user ? req.user.name : 'Support Agent',
      userRole: req.user ? req.user.role : 'support_staff',
      action: 'CREATE',
      entityType: 'SupportTicket',
      entityId: ticket._id.toString(),
      details: `Created Ticket #${ticket.ticketNumber} for ${customer.fullName} [${ticket.sentiment}]`,
    });

    res.status(201).json({ success: true, data: ticket });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update ticket status and resolution notes
// @route   PUT /api/tickets/:id
// @access  Private
exports.updateTicket = async (req, res) => {
  try {
    const { status, priority, resolutionNotes, assignedTo } = req.body;
    const ticket = await SupportTicket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }

    if (status) ticket.status = status;
    if (priority) ticket.priority = priority;
    if (resolutionNotes) ticket.resolutionNotes = resolutionNotes;
    if (assignedTo) ticket.assignedTo = assignedTo;

    if (status === 'Resolved' || status === 'Closed') {
      ticket.resolvedAt = new Date();
    }

    await ticket.save();

    res.status(200).json({ success: true, data: ticket });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Voice of Customer Sentiment Analytics
// @route   GET /api/tickets/voice-of-customer
// @access  Private
exports.getVoiceOfCustomer = async (req, res) => {
  try {
    const sentimentCounts = await SupportTicket.aggregate([
      { $group: { _id: '$sentiment', count: { $sum: 1 } } },
    ]);

    const categoryBreakdown = await SupportTicket.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          churnSignals: { $sum: { $cond: ['$churnSignalTriggered', 1, 0] } },
        },
      },
      { $sort: { count: -1 } },
    ]);

    const recentNegative = await SupportTicket.find({
      sentiment: { $in: ['Frustrated', 'Negative'] },
    })
      .sort({ createdAt: -1 })
      .limit(6)
      .select('ticketNumber customerName subject sentiment category churnRiskLevel createdAt');

    res.status(200).json({
      success: true,
      data: {
        sentimentCounts,
        categoryBreakdown,
        recentNegative,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
