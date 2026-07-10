const Complaint = require('../models/Complaint');
const Department = require('../models/Department');
const User = require('../models/User');
const Notification = require('../models/Notification');
const AuditLog = require('../models/AuditLog');
const Feedback = require('../models/Feedback');
const { uploadImage } = require('../config/cloudinary');

const notifyUser = async (recipientId, complaintId, message) => {
  try {
    await Notification.create({
      recipient: recipientId,
      complaint: complaintId,
      message,
    });
  } catch (err) {
    console.error('Failed to create notification:', err);
  }
};

const logAudit = async (complaintId, status, actorId, actionDescription) => {
  try {
    await AuditLog.create({
      complaint: complaintId,
      status,
      actor: actorId,
      actionDescription,
    });
  } catch (err) {
    console.error('Failed to create audit log:', err);
  }
};

exports.createComplaint = async (req, res, next) => {
  try {
    const { title, description, category, location } = req.body;

    const files = req.files || [];
    const imageUrls = [];
    for (const file of files) {
      const url = await uploadImage(file);
      imageUrls.push(url);
    }

    const parsedLocation = typeof location === 'string' ? JSON.parse(location) : location;
    const complaintWard = parsedLocation?.ward;

    // Map Category to Department
    const categoryToDeptCode = {
      'Road Damage': 'ROAD',
      'Water Leakage': 'WATER',
      'Drainage': 'WATER',
      'Street Light': 'ELECTRICITY',
      'Garbage Collection': 'SANITATION',
      'Public Toilet': 'SANITATION',
      'Parks': 'PARKS',
      'Illegal Construction': 'ROAD',
      'Stray Animals': 'SANITATION',
      'Others': 'ROAD',
    };
    const deptCode = categoryToDeptCode[category] || 'ROAD';
    const dept = await Department.findOne({ code: deptCode });

    let assignedEmp = null;
    let status = 'Pending';
    if (dept && complaintWard) {
      assignedEmp = await User.findOne({
        role: 'employee',
        ward: complaintWard,
        department: dept._id,
      });
    }

    if (assignedEmp) {
      status = 'Assigned';
    }

    const complaint = await Complaint.create({
      title,
      description,
      category,
      department: dept ? dept._id : null,
      location: parsedLocation,
      citizen: req.user.id,
      images: imageUrls,
      status: status,
      assignedTo: assignedEmp ? assignedEmp._id : null,
    });

    if (assignedEmp) {
      await notifyUser(assignedEmp._id, complaint._id, `New complaint ${complaint.complaintId} has been auto-assigned to you in ${complaintWard}`);
      await logAudit(
        complaint._id,
        'Assigned',
        req.user.id,
        `Complaint auto-assigned to ${assignedEmp.name} (Ward: ${complaintWard})`
      );
    } else {
      await logAudit(
        complaint._id,
        'Pending',
        req.user.id,
        `Complaint created by citizen ${req.user.name} (Pending Assignment)`
      );
    }

    res.status(201).json({ success: true, complaint });
  } catch (error) {
    next(error);
  }
};

exports.getComplaints = async (req, res, next) => {
  try {
    const { complaintId, category, department, status, startDate, endDate, ward, area, isDisputed } = req.query;
    let query = {};

    // RBAC filtering
    if (req.user.role === 'citizen') {
      query.citizen = req.user.id;
    } else if (req.user.role === 'employee') {
      if (!req.user.department) {
        return res.status(200).json({ success: true, complaints: [] });
      }
      query.department = req.user.department;
      if (req.user.ward) {
        query['location.ward'] = req.user.ward;
      }
    }

    // Search and filter params
    if (isDisputed === 'true' || isDisputed === true) {
      query.isDisputed = true;
    }
    if (complaintId) {
      query.complaintId = { $regex: complaintId, $options: 'i' };
    }
    if (category) {
      query.category = category;
    }
    if (department) {
      query.department = department;
    }
    if (status) {
      query.status = status;
    }
    if (ward) {
      query['location.ward'] = { $regex: ward, $options: 'i' };
    }
    if (area) {
      query['location.area'] = { $regex: area, $options: 'i' };
    }
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const complaints = await Complaint.find(query)
      .populate('citizen', 'name email phone')
      .populate('department', 'name code')
      .populate('assignedTo', 'name email phone')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, complaints });
  } catch (error) {
    next(error);
  }
};

exports.getComplaintById = async (req, res, next) => {
  try {
    const complaint = await Complaint.findById(req.params.id)
      .populate('citizen', 'name email phone')
      .populate('department', 'name code')
      .populate('assignedTo', 'name email phone')
      .populate('remarks.user', 'name role');

    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    // Role verification
    if (req.user.role === 'citizen' && complaint.citizen._id.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this complaint' });
    }
    if (
      req.user.role === 'employee' &&
      complaint.department &&
      complaint.department._id.toString() !== req.user.department?.toString()
    ) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this complaint' });
    }

    // Get audit logs & feedback
    const auditLogs = await AuditLog.find({ complaint: complaint._id })
      .populate('actor', 'name role')
      .sort({ createdAt: 1 });

    const feedback = await Feedback.findOne({ complaint: complaint._id });

    res.status(200).json({ success: true, complaint, auditLogs, feedback });
  } catch (error) {
    next(error);
  }
};

exports.editComplaint = async (req, res, next) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    if (complaint.citizen.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to modify this complaint' });
    }

    if (complaint.status !== 'Pending') {
      return res.status(400).json({ success: false, message: 'Complaint cannot be edited after assignment' });
    }

    const { title, description, category, location } = req.body;
    if (title) complaint.title = title;
    if (description) complaint.description = description;
    if (category) complaint.category = category;
    if (location) complaint.location = typeof location === 'string' ? JSON.parse(location) : location;

    // Handle new images
    const files = req.files || [];
    if (files.length > 0) {
      const imageUrls = [];
      for (const file of files) {
        const url = await uploadImage(file);
        imageUrls.push(url);
      }
      complaint.images = [...complaint.images, ...imageUrls];
    }

    await complaint.save();
    await logAudit(complaint._id, 'Pending', req.user.id, `Complaint updated by citizen`);

    res.status(200).json({ success: true, complaint });
  } catch (error) {
    next(error);
  }
};

exports.deleteComplaint = async (req, res, next) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    if (complaint.citizen.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this complaint' });
    }

    if (complaint.status !== 'Pending') {
      return res.status(400).json({ success: false, message: 'Complaint cannot be deleted after assignment' });
    }

    await complaint.deleteOne();
    res.status(200).json({ success: true, message: 'Complaint deleted successfully' });
  } catch (error) {
    next(error);
  }
};

exports.assignComplaint = async (req, res, next) => {
  try {
    const { departmentId, employeeId, priority } = req.body;
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    if (departmentId) {
      complaint.department = departmentId;
    }
    if (employeeId) {
      complaint.assignedTo = employeeId;
      complaint.status = 'Assigned';
    } else if (departmentId) {
      complaint.status = 'Assigned';
    }
    if (priority) {
      complaint.priority = priority;
    }
    complaint.isDisputed = false;

    await complaint.save();

    const actorName = req.user.name;
    const dept = departmentId ? await Department.findById(departmentId) : null;
    const emp = employeeId ? await User.findById(employeeId) : null;

    let logMessage = `Complaint assigned by admin (${actorName})`;
    if (dept) logMessage += ` to department: ${dept.name}`;
    if (emp) logMessage += ` and employee: ${emp.name}`;
    if (priority) logMessage += ` with priority: ${priority}`;

    await logAudit(complaint._id, complaint.status, req.user.id, logMessage);

    // Notify citizen
    await notifyUser(
      complaint.citizen,
      complaint._id,
      `Your complaint has been assigned to ${dept?.name || 'department'}. Priority: ${complaint.priority}`
    );

    // Notify employee if assigned
    if (employeeId) {
      await notifyUser(
        employeeId,
        complaint._id,
        `You have been assigned a new complaint: ${complaint.complaintId}`
      );
    }

    res.status(200).json({ success: true, complaint });
  } catch (error) {
    next(error);
  }
};

exports.employeeAccept = async (req, res, next) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    // Verify it is assigned to this employee or their department
    if (
      complaint.assignedTo?.toString() !== req.user.id &&
      complaint.department?.toString() !== req.user.department?.toString()
    ) {
      return res.status(403).json({ success: false, message: 'Not authorized to accept this complaint' });
    }

    complaint.status = 'Accepted';
    if (!complaint.assignedTo) {
      complaint.assignedTo = req.user.id;
    }

    await complaint.save();
    await logAudit(
      complaint._id,
      'Accepted',
      req.user.id,
      `Complaint accepted by employee ${req.user.name}`
    );

    await notifyUser(
      complaint.citizen,
      complaint._id,
      `Your complaint has been accepted by employee ${req.user.name} and work will begin shortly.`
    );

    res.status(200).json({ success: true, complaint });
  } catch (error) {
    next(error);
  }
};

exports.updateStatus = async (req, res, next) => {
  try {
    const { status, remarks } = req.body;
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    // Role-based status flow checks
    const oldStatus = complaint.status;
    complaint.status = status;

    if (remarks) {
      complaint.remarks.push({
        user: req.user.id,
        comment: remarks,
      });
    }

    // Handle employee upload of progress images if status changes to In Progress or Resolved
    const files = req.files || [];
    if (files.length > 0) {
      const imageUrls = [];
      for (const file of files) {
        const url = await uploadImage(file);
        imageUrls.push(url);
      }
      complaint.progressImages = [...complaint.progressImages, ...imageUrls];
    }

    if (status === 'Resolved') {
      complaint.isDisputed = false;
    }

    await complaint.save();

    await logAudit(
      complaint._id,
      status,
      req.user.id,
      `Status changed from ${oldStatus} to ${status} by ${req.user.name}. ${remarks ? `Remark: "${remarks}"` : ''}`
    );

    // Notifications
    let notificationMsg = `Your complaint ${complaint.complaintId} status updated to: ${status}`;
    if (status === 'Resolved') {
      notificationMsg = `Your complaint ${complaint.complaintId} has been resolved. Please verify the resolution.`;
    } else if (status === 'Closed') {
      notificationMsg = `Your complaint ${complaint.complaintId} is now closed. Thank you!`;
    }

    await notifyUser(complaint.citizen, complaint._id, notificationMsg);

    res.status(200).json({ success: true, complaint });
  } catch (error) {
    next(error);
  }
};

exports.reopenComplaint = async (req, res, next) => {
  try {
    const { remarks } = req.body;
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    if (complaint.citizen.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Only the citizen who filed this complaint can reopen it' });
    }

    const oldStatus = complaint.status;
    
    // Auto-resolve staff based on Ward & Category
    const categoryToDeptCode = {
      'Road Damage': 'ROAD',
      'Water Leakage': 'WATER',
      'Drainage': 'WATER',
      'Street Light': 'ELECTRICITY',
      'Garbage Collection': 'SANITATION',
      'Public Toilet': 'SANITATION',
      'Parks': 'PARKS',
      'Illegal Construction': 'ROAD',
      'Stray Animals': 'SANITATION',
      'Others': 'ROAD',
    };
    const deptCode = categoryToDeptCode[complaint.category] || 'ROAD';
    const dept = await Department.findOne({ code: deptCode });

    let assignedEmp = null;
    let newStatus = 'Pending';
    if (dept && complaint.location?.ward) {
      assignedEmp = await User.findOne({
        role: 'employee',
        ward: complaint.location.ward,
        department: dept._id,
      });
    }

    if (assignedEmp) {
      complaint.assignedTo = assignedEmp._id;
      newStatus = 'Assigned';
    } else {
      complaint.assignedTo = null;
    }
    complaint.status = newStatus;
    complaint.isDisputed = true;

    if (remarks) {
      complaint.remarks.push({
        user: req.user.id,
        comment: `REOPENED & DISPUTED: ${remarks}`,
      });
    }

    await complaint.save();

    await logAudit(
      complaint._id,
      newStatus,
      req.user.id,
      `Complaint reopened by citizen (Auto-Assigned back to ward staff). Reason: ${remarks}`
    );

    // Notify all admins/municipal officers of the dispute
    const admins = await User.find({ role: 'admin' });
    for (const admin of admins) {
      await notifyUser(
        admin._id,
        complaint._id,
        `⚠️ DISPUTE ALERT: Complaint ${complaint.complaintId} has been reopened by citizen Nitin Singh. Remarks: "${remarks || 'No remarks provided'}"`
      );
    }

    res.status(200).json({ success: true, complaint });
  } catch (error) {
    next(error);
  }
};

exports.submitFeedback = async (req, res, next) => {
  try {
    const { rating, comments } = req.body;
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    if (complaint.citizen.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Only the citizen can submit feedback' });
    }

    const feedback = await Feedback.create({
      complaint: complaint._id,
      citizen: req.user.id,
      rating,
      comments,
    });

    // Also close the complaint automatically once feedback is received
    complaint.status = 'Closed';
    await complaint.save();

    await logAudit(
      complaint._id,
      'Closed',
      req.user.id,
      `Feedback submitted (Rating: ${rating}/5). Complaint closed automatically.`
    );

    res.status(201).json({ success: true, feedback, complaint });
  } catch (error) {
    next(error);
  }
};

exports.getNearbyComplaints = async (req, res, next) => {
  try {
    const { latitude, longitude, category } = req.query;
    if (!latitude || !longitude || !category) {
      return res.status(400).json({ success: false, message: 'Missing parameters' });
    }
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);

    // Fetch active unresolved complaints of same category
    const complaints = await Complaint.find({
      category,
      status: { $nin: ['Resolved', 'Closed'] }
    });

    // Haversine distance
    const calculateDistance = (lat1, lon1, lat2, lon2) => {
      const R = 6371000; // meters
      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLon = (lon2 - lon1) * Math.PI / 180;
      const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
        Math.sin(dLon/2) * Math.sin(dLon/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      return R * c; // in meters
    };

    const nearby = complaints.map(c => {
      if (!c.location || !c.location.coordinates || typeof c.location.coordinates.latitude !== 'number') {
        return { complaint: c, distance: Infinity };
      }
      const dist = calculateDistance(lat, lng, c.location.coordinates.latitude, c.location.coordinates.longitude);
      return { complaint: c, distance: Math.round(dist) };
    }).filter(item => item.distance <= 100) // 100 meters limit
      .sort((a, b) => a.distance - b.distance);

    res.status(200).json({ success: true, complaints: nearby });
  } catch (err) {
    next(err);
  }
};

exports.upvoteComplaint = async (req, res, next) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    if (!complaint.subscribers.includes(req.user.id)) {
      complaint.subscribers.push(req.user.id);
      
      // Auto-escalate priority based on subscription counts
      if (complaint.subscribers.length >= 5) {
        complaint.priority = 'Critical';
      } else if (complaint.subscribers.length >= 3) {
        complaint.priority = 'High';
      }
      
      await complaint.save();
      await logAudit(complaint._id, complaint.status, req.user.id, `Citizen upvoted and subscribed to this complaint.`);
    }

    res.status(200).json({ success: true, complaint });
  } catch (err) {
    next(err);
  }
};
