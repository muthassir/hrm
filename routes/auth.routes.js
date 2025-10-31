const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const authController = require('../controllers/auth.controller.js');
const { runValidation } = require('../middlewares/validate.middleware.js');
const { authenticate } = require('../middlewares/auth.middleware.js');

router.post('/register',
  body('name').notEmpty(),
  body('email').isEmail(),
  body('password').isLength({ min: 6 }),
  runValidation,
  authController.register
);

router.post('/login',
  body('email').isEmail(),
  body('password').notEmpty(),
  runValidation,
  authController.login
);
router.post('/refresh', authController.refresh);
router.post('/logout', authController.logout);
router.get('/me', authenticate, authController.getProfile);

module.exports = router;
