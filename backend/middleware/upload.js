const multer = require('multer');
const path = require('path');
const fs = require('fs');

// FIX: Use __dirname-based absolute path instead of relative 'uploads/'
// Relative path breaks when server is started from a directory other than /backend
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  // FIX: Sanitize original filename to prevent path traversal and special char issues
  filename: (req, file, cb) => {
    const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    cb(null, `${Date.now()}-${safeName}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowed = ['.jpg', '.jpeg', '.png', '.pdf', '.doc', '.docx'];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowed.includes(ext)) cb(null, true);
  // FIX: Pass error as first arg so global error handler in server.js catches it
  else cb(new Error('Invalid file type. Allowed: JPG, PNG, PDF, DOC, DOCX'), false);
};

exports.upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});
