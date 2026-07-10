const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const seedData = require('./utils/seeder');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB().then(() => {
  // Seed initial data (Admin, Employees, Departments, Complaints)
  seedData();
});

const app = express();

// Middleware
const allowedOrigins = [
  "http://localhost:5173",
  "https://fix-my-city-woad.vercel.app",
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error(`Origin ${origin} not allowed by CORS`));
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve temporary uploads directory for local static fallback (optional)
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/departments', require('./routes/department'));
app.use('/api/complaints', require('./routes/complaint'));
app.use('/api/analytics', require('./routes/analytics'));
app.use('/api/public', require('./routes/public'));
app.use('/api/notifications', require('./routes/notification'));

// Base health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'FixMyCity API is running smoothly' });
});

// Centralized error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
