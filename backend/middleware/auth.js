const jwt = require('jsonwebtoken');

const JWT_SECRET = String(process.env.JWT_SECRET || '');
if (JWT_SECRET.length < 32) throw new Error('JWT_SECRET must be at least 32 characters.');

function authenticate(req, res, next) {
  const token = req.header('Authorization')?.replace(/^Bearer\s+/i, '');
  if (!token) return res.status(401).json({ error: 'Access denied' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    return next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

module.exports = authenticate;
module.exports.JWT_SECRET = JWT_SECRET;
