const express = require('express')
const router = express.Router()
const employeeController = require('../controllers/employee.controller.js');
const { authenticate } = require('../middlewares/auth.middleware.js');
const { allowRoles } = require('../middlewares/role.middleware.js');

router.use(authenticate);
router.get('/me', async (req, res) => res.json({ success: true, data: req.user }));

router.post('/', allowRoles('admin'), employeeController.createEmployee);
router.get('/', allowRoles('admin'), employeeController.listEmployees);
router.get('/office', allowRoles('admin'), employeeController.getOfficeLocation);
router.post('/office', allowRoles('admin'), employeeController.setOfficeLocation);

router.get('/:id', allowRoles('admin'), employeeController.getEmployee);
router.put('/:id', allowRoles('admin'), employeeController.updateEmployee);
router.delete('/:id', allowRoles('admin'), employeeController.deleteEmployee);

module.exports = router;
