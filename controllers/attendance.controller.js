const Attendance = require('../models/Attendance.js');
const Config = require('../models/Config.js');
const User = require('../models/User.js');
const { haversineDistance } = require('../utils/haversine.js');

function getDateString(d = new Date()) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth()+1).padStart(2,'0');
  const dd = String(d.getDate()).padStart(2,'0');
  return `${yyyy}-${mm}-${dd}`;
}

exports.checkIn = async (req, res, next) => {
  try {
    const { lat, lng } = req.body;
    if (typeof lat !== 'number' || typeof lng !== 'number') return res.status(400).json({ success: false, message: 'lat and lng required as numbers' });

    const officeConfig = await Config.findOne({ key: 'officeLocation' });
    if (!officeConfig) return res.status(400).json({ success: false, message: 'Office location not set by admin' });
    const { latitude, longitude, radius } = officeConfig.value;

    const distance = haversineDistance(latitude, longitude, lat, lng);
    const withinRadius = distance <= radius;

    const dateStr = getDateString();
    let record = await Attendance.findOne({ user: req.user._id, date: dateStr });
    if (!record) {
      record = new Attendance({ user: req.user._id, date: dateStr });
    }
    if (record.checkIn && record.checkIn.time) {
      return res.status(400).json({ success: false, message: 'Already checked in today' });
    }
    record.checkIn = { time: new Date(), location: { lat, lng }, withinRadius };
    await record.save();
    res.json({ success: true, data: { distance, withinRadius, record } });
  } catch (err) { next(err); }
};

exports.checkOut = async (req, res, next) => {
  try {
    const { lat, lng } = req.body;
    if (typeof lat !== 'number' || typeof lng !== 'number') return res.status(400).json({ success: false, message: 'lat and lng required as numbers' });

    const officeConfig = await Config.findOne({ key: 'officeLocation' });
    if (!officeConfig) return res.status(400).json({ success: false, message: 'Office location not set by admin' });
    const { latitude, longitude, radius } = officeConfig.value;

    const distance = haversineDistance(latitude, longitude, lat, lng);
    const withinRadius = distance <= radius;

    const dateStr = getDateString();
    let record = await Attendance.findOne({ user: req.user._id, date: dateStr });
    if (!record || !record.checkIn || !record.checkIn.time) {
      return res.status(400).json({ success: false, message: 'Cannot check out without checking in' });
    }
    if (record.checkOut && record.checkOut.time) {
      return res.status(400).json({ success: false, message: 'Already checked out today' });
    }
    record.checkOut = { time: new Date(), location: { lat, lng }, withinRadius };
    await record.save();
    res.json({ success: true, data: { distance, withinRadius, record } });
  } catch (err) { next(err); }
};

exports.myAttendance = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, from, to } = req.query;
    const filter = { user: req.user._id };
    if (from || to) filter.date = {};
    if (from) filter.date.$gte = from;
    if (to) filter.date.$lte = to;

    const skip = (parseInt(page)-1) * parseInt(limit);
    const total = await Attendance.countDocuments(filter);
    const items = await Attendance.find(filter).skip(skip).limit(parseInt(limit)).sort({ date: -1 });
    res.json({ success: true, data: { total, page: parseInt(page), limit: parseInt(limit), items } });
  } catch (err) { next(err); }
};
