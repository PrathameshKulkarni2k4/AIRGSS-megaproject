const jwt = require('jsonwebtoken');
const Citizen = require('../models/Citizen');

exports.protect = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    if (!token) return res.status(401).json({ success: false, message: 'Not authorized, no token' });

    let decoded;
    try {
      // FIX: Always use process.env.JWT_SECRET — removed fallback string mismatch
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (jwtErr) {
      // FIX: Provide specific error messages for expired vs invalid tokens
      if (jwtErr.name === 'TokenExpiredError') {
        return res.status(401).json({ success: false, message: 'Session expired, please login again' });
      }
      return res.status(401).json({ success: false, message: 'Invalid token, please login again' });
    }

    req.user = await Citizen.findById(decoded.id).select('-password');
    if (!req.user) return res.status(401).json({ success: false, message: 'User not found' });
    if (!req.user.isActive) return res.status(401).json({ success: false, message: 'Account deactivated' });
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Not authorized' });
  }
};

exports.authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ success: false, message: `Role '${req.user.role}' is not authorized to access this route` });
  }
  next();
};
