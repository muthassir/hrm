const mongoose = require('mongoose');

const AttendanceSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: String, required: true },
  checkIn: {
    time: { type: Date },
    location: {
      lat: Number,
      lng: Number
    },
    withinRadius: { type: Boolean }
  },
  checkOut: {
    time: { type: Date },
    location: {
      lat: Number,
      lng: Number
    },
    withinRadius: { type: Boolean }
  },
  createdAt: { type: Date, default: Date.now }
});

AttendanceSchema.index({ user: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', AttendanceSchema);
