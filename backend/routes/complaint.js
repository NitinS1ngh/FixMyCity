const express = require('express');
const router = express.Router();
const {
  createComplaint,
  getComplaints,
  getComplaintById,
  editComplaint,
  deleteComplaint,
  assignComplaint,
  employeeAccept,
  updateStatus,
  reopenComplaint,
  submitFeedback,
  getNearbyComplaints,
  upvoteComplaint,
} = require('../controllers/complaintController');
const { protect, restrictTo } = require('../middleware/auth');
const upload = require('../middleware/upload');
const { validateComplaint } = require('../validators/complaint');
const rateLimiter = require('../middleware/rateLimiter');

const createComplaintLimiter = rateLimiter({
  windowMs: 30 * 60 * 1000, // 30 minutes (30 min)
  max: 3, // 3 complaints per 30 minutes per Citizen
  message: 'You have exceeded the limit of filing 3 complaints per 30 minutes. Please try again later.'
});

router.route('/')
  .post(protect, restrictTo('citizen'), createComplaintLimiter, upload.array('images', 5), validateComplaint, createComplaint)
  .get(protect, getComplaints);

router.get('/nearby', protect, getNearbyComplaints);

router.route('/:id')
  .get(protect, getComplaintById)
  .put(protect, restrictTo('citizen'), upload.array('images', 5), editComplaint)
  .delete(protect, restrictTo('citizen'), deleteComplaint);

router.patch('/:id/assign', protect, restrictTo('admin'), assignComplaint);
router.patch('/:id/accept', protect, restrictTo('employee'), employeeAccept);
router.patch('/:id/status', protect, restrictTo('employee', 'admin'), upload.array('images', 5), updateStatus);
router.patch('/:id/reopen', protect, restrictTo('citizen'), reopenComplaint);
router.post('/:id/feedback', protect, restrictTo('citizen'), submitFeedback);
router.post('/:id/upvote', protect, restrictTo('citizen'), upvoteComplaint);

module.exports = router;
