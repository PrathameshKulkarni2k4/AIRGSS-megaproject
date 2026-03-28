const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const CitizenSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, minlength: 6 },
  phone: { type: String, required: true },
  address: { type: String },
  village: { type: String },
  district: { type: String },
  state: { type: String },
  income: { type: Number },
  occupation: { type: String },
  age: { type: Number },
  gender: { type: String, enum: ['male', 'female', 'other'] },
  familySize: { type: Number },
  role: { type: String, enum: ['citizen', 'officer', 'admin'], default: 'citizen' },
  department: { type: String },
  isVerified: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  profileComplete: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

CitizenSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  this.profileComplete = !!(this.income && this.occupation && this.age && this.gender && this.address);
  next();
});

CitizenSchema.methods.comparePassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('Citizen', CitizenSchema);
