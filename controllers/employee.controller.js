const User = require('../models/User.js');
const Config = require('../models/Config.js');
const bcrypt = require('bcrypt');

exports.createEmployee = async (req, res, next) => {
  try {
    const { name, email, phone, designation, department, dateOfJoining, password } = req.body;
    if (!password) return res.status(400).json({ success: false, message: 'Password required' });

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ success: false, message: 'Email already used' });

    const hash = await bcrypt.hash(password, parseInt(process.env.SALT_ROUNDS || '10'));
    const user = await User.create({ 
      name, email, phone, designation, department, dateOfJoining, 
      password: hash, role: 'employee', 
      createdBy: req.user._id 
    });
    res.status(201).json({ success: true, data: user });
  } catch (err) { next(err); }
};

exports.listEmployees = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, q, department } = req.query;
    const filter = { role: 'employee', createdBy: req.user._id }; // Filter by creator
    
    if (q) filter.$or = [
      { name: new RegExp(q, 'i') },
      { email: new RegExp(q, 'i') },
      { phone: new RegExp(q, 'i') }
    ];
    if (department) filter.department = department;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await User.countDocuments(filter);
    const items = await User.find(filter).skip(skip).limit(parseInt(limit)).select('-password -refreshToken').sort({ createdAt: -1 });
    res.json({ success: true, data: { total, page: parseInt(page), limit: parseInt(limit), items } });
  } catch (err) { next(err); }
};

exports.getEmployee = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password -refreshToken');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, data: user });
  } catch (err) { next(err); }
};

exports.updateEmployee = async (req, res, next) => {
  try {
    const updates = req.body;
    if (updates.password) delete updates.password; 
    const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true }).select('-password -refreshToken');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, data: user });
  } catch (err) { next(err); }
};

exports.deleteEmployee = async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, message: 'Deleted' });
  } catch (err) { next(err); }
};

exports.setOfficeLocation = async (req, res, next) => {
  try {
    const { latitude, longitude, radius } = req.body;
    if (typeof latitude !== 'number' || typeof longitude !== 'number' || typeof radius !== 'number') {
      return res.status(400).json({ success: false, message: 'latitude, longitude and radius (meters) are required and must be numbers' });
    }
    const updated = await Config.findOneAndUpdate(
      { key: 'officeLocation' },
      { value: { latitude, longitude, radius }, updatedAt: new Date() },
      { upsert: true, new: true }
    );
    res.json({ success: true, data: updated });
  } catch (err) { next(err); }
};

exports.getOfficeLocation = async (req, res, next) => {
  try {
    const config = await Config.findOne({ key: 'officeLocation' });
    res.json({ success: true, data: config ? config.value : null });
  } catch (err) { next(err); }
};
