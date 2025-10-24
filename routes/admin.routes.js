const express = require('express');
const router = express.Router();
const { authenticate } = require('../middlewares/auth.middleware.js');
const { allowRoles } = require('../middlewares/role.middleware.js');
const dashboardController = require('../controllers/dashboard.controller.js');

router.use(authenticate, allowRoles('admin'));

router.get('/attendance', dashboardController.adminAttendanceList); 
router.get('/summary', dashboardController.dailySummary);

module.exports = router;
