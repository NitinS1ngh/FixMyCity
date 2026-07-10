const mongoose = require('mongoose');

const remarkSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  comment: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const complaintSchema = new mongoose.Schema(
  {
    complaintId: {
      type: String,
      unique: true,
    },
    title: {
      type: String,
      required: [true, 'Please provide a title'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Please provide a description'],
    },
    category: {
      type: String,
      enum: [
        'Garbage Collection',
        'Road Damage',
        'Water Leakage',
        'Drainage',
        'Street Light',
        'Illegal Construction',
        'Public Toilet',
        'Parks',
        'Stray Animals',
        'Others',
      ],
      required: [true, 'Please select a category'],
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      default: null,
    },
    citizen: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    status: {
      type: String,
      enum: [
        'Pending',
        'Assigned',
        'Accepted',
        'In Progress',
        'Resolved',
        'Citizen Verification',
        'Closed',
      ],
      default: 'Pending',
    },
    location: {
      address: { type: String, required: true },
      ward: { type: String, required: true },
      area: { type: String, required: true },
      coordinates: {
        latitude: { type: Number },
        longitude: { type: Number },
      },
    },
    images: [{ type: String }],
    progressImages: [{ type: String }],
    remarks: [remarkSchema],
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Critical'],
      default: 'Medium',
    },
    subscribers: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    isDisputed: {
      type: Boolean,
      default: false
    },
  },
  { timestamps: true }
);

// Auto-generate FMC-YYYY-NUMBER style ID
complaintSchema.pre('save', async function (next) {
  if (!this.complaintId) {
    const year = new Date().getFullYear();
    const lastComplaint = await mongoose.model('Complaint')
      .findOne({ complaintId: new RegExp(`^FMC-${year}-`) })
      .sort({ complaintId: -1 });

    let nextNum = 1;
    if (lastComplaint && lastComplaint.complaintId) {
      const parts = lastComplaint.complaintId.split('-');
      const lastSeq = parseInt(parts[2], 10);
      if (!isNaN(lastSeq)) {
        nextNum = lastSeq + 1;
      }
    }
    
    // Add a tiny random suffix if we are under high concurrency to guarantee uniqueness
    const randomSuffix = Math.floor(100 + Math.random() * 900); // 3-digit random number
    const sequence = String(nextNum).padStart(4, '0');
    this.complaintId = `FMC-${year}-${sequence}-${randomSuffix}`;
  }
  next();
});

module.exports = mongoose.model('Complaint', complaintSchema);
