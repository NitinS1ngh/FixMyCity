const Complaint = require('../models/Complaint');
const Department = require('../models/Department');
const User = require('../models/User');

exports.getAdminAnalytics = async (req, res, next) => {
  try {
    const totalComplaints = await Complaint.countDocuments();
    const activeComplaints = await Complaint.countDocuments({ status: { $ne: 'Closed' } });
    const closedComplaints = await Complaint.countDocuments({ status: 'Closed' });
    const totalEmployees = await User.countDocuments({ role: 'employee' });
    const totalDepartments = await Department.countDocuments();

    // 1. Pending vs Resolved vs In Progress count
    const statusCounts = await Complaint.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    // 2. Complaints by Category
    const categoryCounts = await Complaint.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    // 3. Ward-wise Complaints
    const wardCounts = await Complaint.aggregate([
      { $group: { _id: '$location.ward', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    // 4. Monthly Complaints (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const monthlyCounts = await Complaint.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    // Format monthly counts to readable months
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const formattedMonthly = monthlyCounts.map((item) => {
      return {
        month: `${monthNames[item._id.month - 1]} ${item._id.year}`,
        count: item.count,
      };
    });

    // 5. Department Performance
    const deptPerformance = await Department.aggregate([
      {
        $lookup: {
          from: 'complaints',
          localField: '_id',
          foreignField: 'department',
          as: 'complaints',
        },
      },
      {
        $project: {
          name: 1,
          code: 1,
          total: { $size: '$complaints' },
          resolved: {
            $size: {
              $filter: {
                input: '$complaints',
                as: 'c',
                cond: { $in: ['$$c.status', ['Resolved', 'Closed']] },
              },
            },
          },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: {
        summary: {
          totalComplaints,
          activeComplaints,
          closedComplaints,
          totalEmployees,
          totalDepartments,
        },
        statusCounts,
        categoryCounts,
        wardCounts,
        monthlyCounts: formattedMonthly,
        deptPerformance,
      },
    });
  } catch (error) {
    next(error);
  }
};
