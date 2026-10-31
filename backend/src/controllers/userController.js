const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');

// @desc    Get all users with search and role filter
// @route   GET /api/users
// @access  Private/Admin
exports.getUsers = async (req, res) => {
  try {
    const { search, role, page = 1, limit = 20 } = req.query;
    const query = {};

    if (role && role !== 'all') {
      query.role = role;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { department: { $regex: search, $options: 'i' } },
      ];
    }

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      count: users.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      data: users,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create new user with role
// @route   POST /api/users
// @access  Private/Admin
exports.createUser = async (req, res) => {
  try {
    const { name, email, password, role, department, phone } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'A user with this email already exists.',
      });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: role || 'support_staff',
      department: department || 'Retail Operations',
      phone: phone || '',
    });

    await ActivityLog.create({
      user: req.user._id,
      userName: req.user.name,
      userRole: req.user.role,
      action: 'CREATE',
      entityType: 'User',
      entityId: user._id.toString(),
      details: `Admin created staff account for ${user.name} (${user.role})`,
    });

    res.status(201).json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        isActive: user.isActive,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private/Admin
exports.updateUser = async (req, res) => {
  try {
    const { name, email, role, department, isActive, phone } = req.body;

    let user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.name = name || user.name;
    user.email = email || user.email;
    if (role) user.role = role;
    if (department) user.department = department;
    if (typeof isActive === 'boolean') user.isActive = isActive;
    if (phone !== undefined) user.phone = phone;

    await user.save();

    await ActivityLog.create({
      user: req.user._id,
      userName: req.user.name,
      userRole: req.user.role,
      action: 'UPDATE',
      entityType: 'User',
      entityId: user._id.toString(),
      details: `Updated user profile: ${user.name}`,
    });

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own administrative account.',
      });
    }

    await User.findByIdAndDelete(req.params.id);

    await ActivityLog.create({
      user: req.user._id,
      userName: req.user.name,
      userRole: req.user.role,
      action: 'DELETE',
      entityType: 'User',
      entityId: req.params.id,
      details: `Deleted user: ${user.name} (${user.email})`,
    });

    res.status(200).json({
      success: true,
      message: 'User deleted successfully.',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get system activity audit logs
// @route   GET /api/users/audit-logs
// @access  Private/Admin
exports.getAuditLogs = async (req, res) => {
  try {
    const { action, entityType, limit = 50 } = req.query;
    const query = {};
    if (action) query.action = action;
    if (entityType) query.entityType = entityType;

    const logs = await ActivityLog.find(query)
      .sort({ createdAt: -1 })
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      count: logs.length,
      data: logs,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
