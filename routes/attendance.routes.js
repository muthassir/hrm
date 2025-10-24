const express = require('express');
const router = express.Router();
const { authenticate } = require('../middlewares/auth.middleware.js');
const { allowRoles } = require('../middlewares/role.middleware.js');
const attendanceController = require('../controllers/attendance.controller.js');

router.use(authenticate);

router.post('/checkin', allowRoles('employee','admin'), attendanceController.checkIn);
router.post('/checkout', allowRoles('employee','admin'), attendanceController.checkOut);
router.get('/me', allowRoles('employee','admin'), attendanceController.myAttendance);

module.exports = router;
