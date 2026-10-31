const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

// Generate JWT Token
const sendTokenResponse = (user, statusCode, res) => {
  const token = jwt.sign(
    { id: user._id, role: user.role, email: user.email },
    process.env.JWT_SECRET || 'retailsync_super_secret_jwt_key_2026_dev_prod',
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );

  const cookieExpireDays = parseInt(process.env.COOKIE_EXPIRE, 10) || 7;
  const options = {
    expires: new Date(Date.now() + cookieExpireDays * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  };

  res
    .status(statusCode)
    .cookie('token', token, options)
    .json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        avatar: user.avatar,
        lastLogin: user.lastLogin,
      },
    });
};

// @desc    Register user (Self-register: non-admin roles only; Admin can specify any role)
// @route   POST /api/auth/register
// @access  Public (restricted role assignment) / Admin
exports.register = async (req, res) => {
  try {
    const { name, email, password, role, department, phone } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'A user with that email already exists.',
      });
    }

    // Role safety check: Public cannot assign 'admin'
    let assignedRole = role || 'support_staff';
    if (assignedRole === 'admin') {
      // Check if requesting user is an authenticated admin
      if (!req.user || req.user.role !== 'admin') {
        const adminCount = await User.countDocuments({ role: 'admin' });
        // Only allow first user ever to become admin
        if (adminCount > 0) {
          assignedRole = 'support_staff';
        }
      }
    }

    const user = await User.create({
      name,
      email,
      password,
      role: assignedRole,
      department: department || 'Operations',
      phone: phone || '',
    });

    await ActivityLog.create({
      user: user._id,
      userName: user.name,
      userRole: user.role,
      action: 'CREATE',
      entityType: 'User',
      entityId: user._id.toString(),
      details: `User account created: ${user.name} (${user.role})`,
    });

    sendTokenResponse(user, 201, res);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error during registration.',
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.',
      });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Please verify your email and password.',
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Please verify your email and password.',
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Account is deactivated. Contact your system administrator.',
      });
    }

    user.lastLogin = Date.now();
    await user.save({ validateBeforeSave: false });

    await ActivityLog.create({
      user: user._id,
      userName: user.name,
      userRole: user.role,
      action: 'LOGIN',
      entityType: 'User',
      entityId: user._id.toString(),
      details: `User logged in from ${req.ip || 'remote client'}`,
      ipAddress: req.ip,
    });

    sendTokenResponse(user, 200, res);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error during login.',
    });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to retrieve profile.',
    });
  }
};

// @desc    Log user out / clear cookie
// @route   GET /api/auth/logout
// @access  Private
exports.logout = async (req, res) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });

  if (req.user) {
    await ActivityLog.create({
      user: req.user._id,
      userName: req.user.name,
      userRole: req.user.role,
      action: 'LOGOUT',
      entityType: 'User',
      entityId: req.user._id.toString(),
      details: `User logged out`,
    });
  }

  res.status(200).json({
    success: true,
    message: 'User logged out successfully.',
    data: {},
  });
};

// @desc    Forgot password
// @route   POST /api/auth/forgotpassword
// @access  Public
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No user registered with this email address.',
      });
    }

    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    // In production, an email would be dispatched.
    // For local evaluation, we return the resetToken so the user can easily test the reset workflow.
    res.status(200).json({
      success: true,
      message: 'Password reset token generated. Use this token to reset your password.',
      resetToken,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error processing forgot password request.',
    });
  }
};

// @desc    Reset password
// @route   PUT /api/auth/resetpassword/:resettoken
// @access  Public
exports.resetPassword = async (req, res) => {
  try {
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(req.params.resettoken)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired password reset token.',
      });
    }

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    sendTokenResponse(user, 200, res);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error resetting password.',
    });
  }
};
