const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();

// FIX: Auto-create uploads directory on startup (prevents multer ENOENT crash)
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('✅ Created uploads directory');
}

// FIX: Proper CORS config — was app.use(cors()) with no options, blocked all credentialed requests
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// FIX: Use absolute path for serving uploads so files are always accessible via URL
app.use('/uploads', express.static(uploadsDir));

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/airgss')
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB error:', err));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/citizens', require('./routes/citizens'));
app.use('/api/complaints', require('./routes/complaints'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/schemes', require('./routes/schemes'));
app.use('/api/documents', require('./routes/documents'));
app.use('/api/chatbot', require('./routes/chatbot'));
app.use('/api/funds', require('./routes/funds'));
app.use('/api/admin', require('./routes/admin'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'AIRGSS API Running', timestamp: new Date() });
});

// FIX: Global error handler now also handles Multer-specific errors gracefully
app.use((err, req, res, next) => {
  console.error(err.stack);
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ success: false, message: 'File too large. Maximum size is 5MB.' });
  }
  if (err.message && err.message.includes('Invalid file type')) {
    return res.status(400).json({ success: false, message: err.message });
  }
  res.status(err.status || 500).json({ success: false, message: err.message || 'Internal Server Error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
