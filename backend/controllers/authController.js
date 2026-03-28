const jwt = require('jsonwebtoken');
const Citizen = require('../models/Citizen');

const signToken = (id) => jwt.sign(
  { id },
  process.env.JWT_SECRET,  // FIX: Removed fallback string — must use .env value consistently
  { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
);

exports.register = async (req, res) => {
  try {
    const { name, email, password, phone, role } = req.body;
    if (!name || !email || !password || !phone) {
      return res.status(400).json({ success: false, message: 'Name, email, password and phone are required' });
    }
    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }
    const existing = await Citizen.findOne({ email: email.toLowerCase() });
    if (existing) return res.status(400).json({ success: false, message: 'Email already registered' });

    // Only allow citizen self-registration — admin/officer created by admin only
    const citizen = await Citizen.create({
      name,
      email,
      password,
      phone,
      role: 'citizen' // FIX: Ignore role from request body — prevents privilege escalation
    });
    const token = signToken(citizen._id);
    res.status(201).json({
      success: true,
      token,
      data: {
        id: citizen._id,
        name: citizen.name,
        email: citizen.email,
        role: citizen.role,
        profileComplete: citizen.profileComplete
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const citizen = await Citizen.findOne({ email: email.toLowerCase() });
    if (!citizen) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }
    const passwordMatch = await citizen.comparePassword(password);
    if (!passwordMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }
    if (!citizen.isActive) {
      return res.status(401).json({ success: false, message: 'Your account has been deactivated. Contact admin.' });
    }

    const token = signToken(citizen._id);
    res.json({
      success: true,
      token,
      data: {
        id: citizen._id,
        name: citizen.name,
        email: citizen.email,
        role: citizen.role,
        profileComplete: citizen.profileComplete,
        department: citizen.department
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getMe = async (req, res) => {
  try {
    // Re-fetch from DB to get fresh data (profileComplete may have changed)
    const citizen = await Citizen.findById(req.user._id).select('-password');
    res.json({ success: true, data: citizen });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const updates = req.body;
    // FIX: Prevent updating sensitive fields via profile update
    delete updates.password;
    delete updates.role;
    delete updates.email;
    delete updates.isActive;
    delete updates.isVerified;

    const citizen = await Citizen.findById(req.user._id);
    if (!citizen) return res.status(404).json({ success: false, message: 'User not found' });

    Object.assign(citizen, updates);
    // profileComplete is recalculated in the pre-save hook
    await citizen.save();

    res.json({ success: true, data: citizen, message: 'Profile updated successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
