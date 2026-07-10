const express = require('express');
const router = express.Router();
const { getAdminAnalytics } = require('../controllers/analyticsController');
const { protect, restrictTo } = require('../middleware/auth');

router.get('/', protect, restrictTo('admin'), getAdminAnalytics);

module.exports = router;
