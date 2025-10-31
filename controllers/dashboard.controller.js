const Attendance = require('../models/Attendance.js');
const User = require('../models/User.js');
const { Parser } = require('json2csv');

function getDateString(d = new Date()) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth()+1).padStart(2,'0');
  const dd = String(d.getDate()).padStart(2,'0');
  return `${yyyy}-${mm}-${dd}`;
}

exports.adminAttendanceList = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, employee, date, department, exportFormat } = req.query;
    const filter = {};
    if (employee) filter.user = employee;
    if (date) filter.date = date;
    if (department) {
      const employees = await User.find({ department, role: 'employee' }).select('_id');
      filter.user = { $in: employees.map(e => e._id) };
    }

    const skip = (parseInt(page)-1)*parseInt(limit);
    const total = await Attendance.countDocuments(filter);
    const items = await Attendance.find(filter).populate('user', 'name email department designation').skip(skip).limit(parseInt(limit)).sort({ date: -1 });

    if (exportFormat === 'csv') {
      const rows = items.map(r => ({
        date: r.date,
        user: r.user ? r.user.name : String(r.user),
        email: r.user ? r.user.email : '',
        department: r.user ? r.user.department : '',
        checkInTime: r.checkIn?.time,
        checkInLatitude: r.checkIn?.location?.lat,
        checkInLongitude: r.checkIn?.location?.lng,
        checkInWithinRadius: r.checkIn?.withinRadius,
        checkOutTime: r.checkOut?.time,
        checkOutLatitude: r.checkOut?.location?.lat,
        checkOutLongitude: r.checkOut?.location?.lng,
        checkOutWithinRadius: r.checkOut?.withinRadius
      }));
      const parser = new Parser();
      const csv = parser.parse(rows);
      res.header('Content-Type', 'text/csv');
      res.attachment(`attendance-${date || getDateString()}.csv`);
      return res.send(csv);
    }
    res.json({ success: true, data: { total, page: parseInt(page), limit: parseInt(limit), items } });
  } catch (err) { next(err); }
};

exports.dailySummary = async (req, res, next) => {
  try {
    const date = req.query.date || getDateString();
    
    const employees = await User.find({ role: 'employee', createdBy: req.user._id }).select('_id name department');
    const empIds = employees.map(e => e._id);
    
    const records = await Attendance.find({ date, user: { $in: empIds } });

    const presentSet = new Set(records.map(r => String(r.user)));
    const present = records.length;
    const absent = employees.length - present;
    const lateCutoff = new Date(`${date}T09:15:00.000Z`);
    let lateCount = 0;
    for (const r of records) {
      if (r.checkIn && r.checkIn.time && r.checkIn.time > lateCutoff) lateCount++;
    }
    res.json({ success: false, data: { date, totalEmployees: employees.length, present, absent, lateCount } });
  } catch (err) { next(err); }
};
