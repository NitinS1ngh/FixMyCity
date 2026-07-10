const rateLimiter = (options = {}) => {
  const windowMs = options.windowMs || 15 * 60 * 1000; // Default 15 minutes
  const max = options.max || 100; // Limit each IP to 100 requests per windowMs
  const message = options.message || 'Too many requests from this IP. Please try again later.';
  
  const ipRequests = new Map();

  // Periodically clean up expired records to avoid memory leaks
  setInterval(() => {
    const now = Date.now();
    for (const [ip, timestamps] of ipRequests.entries()) {
      const activeTimestamps = timestamps.filter(time => now - time < windowMs);
      if (activeTimestamps.length === 0) {
        ipRequests.delete(ip);
      } else {
        ipRequests.set(ip, activeTimestamps);
      }
    }
  }, windowMs);

  return (req, res, next) => {
    const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const now = Date.now();

    if (!ipRequests.has(ip)) {
      ipRequests.set(ip, []);
    }

    const timestamps = ipRequests.get(ip);
    const activeTimestamps = timestamps.filter(time => now - time < windowMs);

    if (activeTimestamps.length >= max) {
      return res.status(429).json({
        success: false,
        message
      });
    }

    activeTimestamps.push(now);
    ipRequests.set(ip, activeTimestamps);
    next();
  };
};

module.exports = rateLimiter;
