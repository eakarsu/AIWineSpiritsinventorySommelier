const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db');
const authenticate = require('../middleware/auth');

router.get('/demo-credentials', (_req, res) => {
  if (process.env.NODE_ENV === 'production') return res.status(404).json({ error: 'Not found' });
  const email = process.env.DEMO_EMAIL || process.env.PROVISION_ADMIN_EMAIL;
  const password = process.env.DEMO_PASSWORD || process.env.PROVISION_ADMIN_PASSWORD;
  if (!email || !password) return res.status(503).json({ error: 'Demo credentials are not configured' });
  return res.json({ email, password });
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ error: 'email and password are required' });
    const result = await pool.query('SELECT * FROM users WHERE lower(email) = $1', [String(email).trim().toLowerCase()]);
    if (result.rows.length === 0) return res.status(401).json({ error: 'Invalid credentials' });
    const user = result.rows[0];
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });
    const token = jwt.sign({ id: user.id, email: user.email, name: user.name, role: user.role },
      authenticate.JWT_SECRET, { expiresIn: '24h' });
    res.json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role } });
  } catch (err) {
    res.status(503).json({ error: 'Authentication service unavailable' });
  }
});

router.get('/me', authenticate, async (req, res) => {
  try {
    const result = await pool.query('SELECT id, email, name, role FROM users WHERE id = $1', [req.user.id]);
    if (!result.rows.length) return res.status(401).json({ error: 'Account no longer exists' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(503).json({ error: 'Authentication service unavailable' });
  }
});

module.exports = router;
