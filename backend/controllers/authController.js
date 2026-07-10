const User = require('../models/User');
const jwt = require('jsonwebtoken');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback_secret', {
    expiresIn: '30d',
  });
};

const sendToken = (user, statusCode, res) => {
  const token = signToken(user._id);

  // Remove password from output
  user.password = undefined;

  res.status(statusCode).json({
    success: true,
    token,
    user,
  });
};

const { uploadImage } = require('../config/cloudinary');

exports.register = async (req, res, next) => {
  try {
    const { name, email, password, phone, role, department, ward } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists with this email' });
    }

    const userRole = role || 'citizen';

    let profilePhotoUrl = '';
    if (req.file) {
      profilePhotoUrl = await uploadImage(req.file);
    }

    const user = await User.create({
      name,
      email,
      password,
      phone,
      role: userRole,
      department: userRole === 'employee' ? department : null,
      ward,
      profilePhoto: profilePhotoUrl,
    });

    sendToken(user, 201, res);
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    if (user.status === 'blocked') {
      return res.status(403).json({ success: false, message: 'Your account has been blocked by the Administrator.' });
    }

    sendToken(user, 200, res);
  } catch (error) {
    next(error);
  }
};

exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).populate('department');
    res.status(200).json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

exports.forgotPassword = async (req, res, next) => {
  // Simple flow for demo: in production would send email. For municipal portal, we allow password updates.
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.status(200).json({
      success: true,
      message: 'Password reset link sent to registered email. For demo purposes, you can directly reset the password using /reset-password endpoint.',
    });
  } catch (error) {
    next(error);
  }
};

exports.resetPassword = async (req, res, next) => {
  try {
    const { email, newPassword } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    user.password = newPassword;
    await user.save();
    res.status(200).json({ success: true, message: 'Password has been reset successfully.' });
  } catch (error) {
    next(error);
  }
};

// Admin operations
exports.getUsers = async (req, res, next) => {
  try {
    const { search, role, status } = req.query;
    let query = {};

    if (role) query.role = role;
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const users = await User.find(query).populate('department');
    res.status(200).json({ success: true, users });
  } catch (error) {
    next(error);
  }
};

exports.toggleUserBlockStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.role === 'admin') {
      return res.status(400).json({ success: false, message: 'Administrators cannot be blocked' });
    }

    user.status = user.status === 'blocked' ? 'active' : 'blocked';
    await user.save();

    res.status(200).json({
      success: true,
      message: `User status changed to ${user.status}`,
      user,
    });
  } catch (error) {
    next(error);
  }
};

exports.updateProfilePhoto = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    let profilePhotoUrl = '';
    if (req.file) {
      profilePhotoUrl = await uploadImage(req.file);
      user.profilePhoto = profilePhotoUrl;
    } else if (req.body.removePhoto === 'true' || req.body.removePhoto === true) {
      user.profilePhoto = '';
    }

    await user.save();
    res.status(200).json({ success: true, user });
  } catch (error) {
    next(error);
  }
};
