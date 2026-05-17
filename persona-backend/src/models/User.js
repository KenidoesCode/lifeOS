const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  email: { 
    type: String, 
    unique: true, 
    sparse: true,
    lowercase: true,
    trim: true
  },
  password: { 
    type: String, 
    select: false 
  },
  googleId: { 
    type: String, 
    unique: true, 
    sparse: true 
  },
  name: { 
    type: String, 
    required: true,
    trim: true
  },
  avatar: { type: String },
  isGuest: { type: Boolean, default: false },
  pushToken: { type: String },
  resetOTP: { type: String },
  resetOTPExpiry: { type: Date },
  notificationsEnabled: { type: Boolean, default: true },
  reminderTime: { type: String, default: '08:00 AM' },
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
