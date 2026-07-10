const Complaint = require('../models/Complaint');

exports.getPublicStats = async (req, res, next) => {
  try {
    const total = await Complaint.countDocuments();
    const resolved = await Complaint.countDocuments({ status: { $in: ['Resolved', 'Closed'] } });
    const pending = await Complaint.countDocuments({ status: 'Pending' });
    const inProgress = await Complaint.countDocuments({ status: { $in: ['Assigned', 'Accepted', 'In Progress', 'Citizen Verification'] } });

    // Category stats
    const categoryStats = await Complaint.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    // Ward stats
    const wardStats = await Complaint.aggregate([
      { $group: { _id: '$location.ward', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    // Recent complaints list - ONLY public, non-personal details (title, category, ward, status, date)
    const recentPublicComplaints = await Complaint.find()
      .select('complaintId title category status location.ward location.area createdAt')
      .sort({ createdAt: -1 })
      .limit(10);

    res.status(200).json({
      success: true,
      stats: {
        total,
        resolved,
        pending,
        inProgress,
        categoryStats,
        wardStats,
      },
      recentComplaints: recentPublicComplaints,
    });
  } catch (error) {
    next(error);
  }
};
