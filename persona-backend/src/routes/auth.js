const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const User = require("../models/User");
const Task = require("../models/Task");

const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET || "lifeos_secret_2024",
    { expiresIn: "30d" }
  );
};

const userResponse = (user, token) => ({
  token,
  user: {
    _id: user._id,
    name: user.name,
    email: user.email,
    avatar: user.avatar,
    isGuest: user.isGuest,
    notificationsEnabled: user.notificationsEnabled,
    reminderTime: user.reminderTime,
    createdAt: user.createdAt,
  },
});

router.post("/register", async (req, res) => {
  try {
    const { name, email, password, guestId } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: "Name, email and password required" });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters" });
    }
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({ error: "Account already exists with this email" });
    }
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);
    const user = new User({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      isGuest: false,
    });
    await user.save();
    if (guestId) {
      await Task.updateMany({ user: guestId }, { user: user._id });
      await User.findByIdAndDelete(guestId);
    }
    const token = generateToken(user._id);
    res.status(201).json(userResponse(user, token));
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ error: "Registration failed" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required" });
    }
    const user = await User.findOne({ email: email.toLowerCase() }).select("+password");
    if (!user || !user.password) {
      return res.status(401).json({ error: "Invalid email or password" });
    }
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ error: "Invalid email or password" });
    }
    const token = generateToken(user._id);
    res.json(userResponse(user, token));
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Login failed" });
  }
});

router.post("/google", async (req, res) => {
  try {
    const { googleId, email, name, avatar } = req.body;
    if (!googleId || !email) {
      return res.status(400).json({ error: "Google auth data required" });
    }
    let user = await User.findOne({ $or: [{ googleId }, { email: email.toLowerCase() }] });
    if (!user) {
      user = new User({ googleId, email: email.toLowerCase(), name, avatar, isGuest: false });
      await user.save();
    } else {
      if (!user.googleId) user.googleId = googleId;
      if (avatar) user.avatar = avatar;
      await user.save();
    }
    const token = generateToken(user._id);
    res.json(userResponse(user, token));
  } catch (err) {
    console.error("Google auth error:", err);
    res.status(500).json({ error: "Google authentication failed" });
  }
});

router.post("/guest", async (req, res) => {
  try {
    const suffix = Math.random().toString(36).substring(2, 8);
    const user = new User({ name: "Guest_" + suffix, isGuest: true });
    await user.save();
    const token = generateToken(user._id);
    res.status(201).json(userResponse(user, token));
  } catch (err) {
    console.error("Guest error:", err);
    res.status(500).json({ error: "Failed to create guest account" });
  }
});

router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ error: "No account found with this email" });
    }
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetOTP = otp;
    user.resetOTPExpiry = new Date(Date.now() + 15 * 60 * 1000);
    await user.save();

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: "LifeOS <" + process.env.EMAIL_USER + ">",
      to: email,
      subject: "LifeOS - Password Reset OTP",
      html: "<div style='background:#000000;padding:40px;font-family:sans-serif;color:white;max-width:500px;margin:0 auto;border-radius:16px;'><h1 style='color:#7C3AED;'>LifeOS</h1><h2 style='color:#FFFFFF;'>Password Reset OTP</h2><p style='color:#AAAAAA;'>Use this OTP to reset your password. Expires in 15 minutes.</p><div style='background:#111111;border:1px solid #333;padding:24px;border-radius:12px;text-align:center;margin:24px 0;'><p style='color:#7C3AED;font-size:40px;font-weight:bold;letter-spacing:12px;margin:0;'>" + otp + "</p></div><p style='color:#444444;font-size:12px;'>If you did not request this, ignore this email.</p></div>",
    });

    res.json({ success: true, message: "OTP sent to your email" });
  } catch (err) {
    console.error("Forgot password error:", err);
    res.status(500).json({ error: "Could not send OTP. Please try again." });
  }
});

router.post("/reset-password", async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    const user = await User.findOne({
      email: email.toLowerCase(),
      resetOTP: otp,
      resetOTPExpiry: { $gt: new Date() },
    });
    if (!user) {
      return res.status(400).json({ error: "Invalid or expired OTP" });
    }
    const salt = await bcrypt.genSalt(12);
    user.password = await bcrypt.hash(newPassword, salt);
    user.resetOTP = undefined;
    user.resetOTPExpiry = undefined;
    await user.save();
    res.json({ success: true, message: "Password reset successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to reset password" });
  }
});

router.get("/me", async (req, res) => {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");
    if (!token) return res.status(401).json({ error: "No token" });
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "lifeos_secret_2024");
    const user = await User.findById(decoded.userId);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(userResponse(user, token).user);
  } catch (err) {
    res.status(401).json({ error: "Invalid token" });
  }
});

router.patch("/update-profile", async (req, res) => {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "lifeos_secret_2024");
    const { name, notificationsEnabled, reminderTime } = req.body;
    const updateData = {};
    if (name) updateData.name = name.trim();
    if (notificationsEnabled !== undefined) updateData.notificationsEnabled = notificationsEnabled;
    if (reminderTime) updateData.reminderTime = reminderTime;
    const user = await User.findByIdAndUpdate(decoded.userId, updateData, { new: true });
    res.json(userResponse(user, token).user);
  } catch (err) {
    res.status(500).json({ error: "Failed to update profile" });
  }
});

module.exports = router;
