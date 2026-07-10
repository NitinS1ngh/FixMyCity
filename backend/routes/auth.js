const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getMe,
  forgotPassword,
  resetPassword,
  getUsers,
  toggleUserBlockStatus,
  updateProfilePhoto,
} = require('../controllers/authController');
const { validateRegister, validateLogin } = require('../validators/auth');
const { protect, restrictTo } = require('../middleware/auth');

const upload = require('../middleware/upload');
const rateLimiter = require('../middleware/rateLimiter');

const authLimiter = rateLimiter({
  windowMs: 30 * 60 * 1000, // 30 minutes
  max: 5,
  message: 'Too many authentication attempts. Please try again after 30 minutes.'
});

router.post('/register', authLimiter, upload.single('profilePhoto'), validateRegister, register);
router.post('/login', authLimiter, validateLogin, login);
router.post('/forgot-password', authLimiter, forgotPassword);
router.post('/reset-password', resetPassword);

router.get('/me', protect, getMe);
router.patch('/profile-photo', protect, upload.single('profilePhoto'), updateProfilePhoto);

// Admin-only user management
router.get('/users', protect, restrictTo('admin'), getUsers);
router.patch('/users/:id/toggle-block', protect, restrictTo('admin'), toggleUserBlockStatus);

module.exports = router;
