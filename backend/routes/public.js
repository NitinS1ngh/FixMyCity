const express = require('express');
const router = express.Router();
const { getPublicStats } = require('../controllers/publicController');
const rateLimiter = require('../middleware/rateLimiter');

const publicStatsLimiter = rateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // 30 requests per minute
  message: 'Too many requests to public statistics. Please wait a minute before retrying.'
});

router.get('/stats', publicStatsLimiter, getPublicStats);

module.exports = router;
