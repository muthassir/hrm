const bcrypt = require('bcrypt');
const User = require('../models/User.js');
const { signAccessToken, signRefreshToken, verifyRefreshToken } = require('../utils/jwt.js');
const { validationResult } = require('express-validator');

const saltRounds = parseInt(process.env.SALT_ROUNDS || '10');

exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ success: false, message: 'Email already in use' });

    const hash = await bcrypt.hash(password, saltRounds);
    const user = await User.create({ name, email, password: hash, role: role || 'employee' });
    res.status(201).json({ success: true, data: { id: user._id, email: user.email, role: user.role } });
  } catch (err) { next(err); }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ success: false, message: 'Invalid credentials' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ success: false, message: 'Invalid credentials' });

    const payload = { id: user._id, role: user.role };
    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);

    user.refreshToken = refreshToken;
    await user.save();

    res.json({ success: true, data: { accessToken, refreshToken, user: { id: user._id, name: user.name, email: user.email, role: user.role } } });
  } catch (err) { next(err); }
};

exports.refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(400).json({ success: false, message: 'Refresh token required' });

    const payload = verifyRefreshToken(refreshToken);
    const user = await User.findById(payload.id);
    if (!user || user.refreshToken !== refreshToken) return res.status(401).json({ success: false, message: 'Invalid refresh token' });

    const newAccess = signAccessToken({ id: user._id, role: user.role });
    const newRefresh = signRefreshToken({ id: user._id, role: user.role });
    user.refreshToken = newRefresh;
    await user.save();

    res.json({ success: true, data: { accessToken: newAccess, refreshToken: newRefresh } });
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid or expired refresh token' });
  }
};

exports.logout = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(400).json({ success: false, message: 'Refresh token required' });

    const payload = verifyRefreshToken(refreshToken);
    const user = await User.findById(payload.id);
    if (user) {
      user.refreshToken = null;
      await user.save();
    }
    res.json({ success: true, message: 'Logged out' });
  } catch (err) {
    res.status(200).json({ success: true, message: 'Logged out' }); 
  }
};

exports.getProfile = async (req, res, next) => {
  try {
    const user = req.user;
    res.json({ success: true, data: { id: user._id, name: user.name, email: user.email, role: user.role, phone: user.phone, designation: user.designation, department: user.department } });
  } catch (err) { next(err); }
};
