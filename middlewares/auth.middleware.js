const { verifyAccessToken } = require('../utils/jwt.js');
const User = require('../models/User.js');

async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ success: false, message: 'Authorization header missing' });
    const token = authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ success: false, message: 'Token missing' });

    const payload = verifyAccessToken(token);
    const user = await User.findById(payload.id).select('-password');
    if (!user) return res.status(401).json({ success: false, message: 'User not found' });

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
}

module.exports = { authenticate };
