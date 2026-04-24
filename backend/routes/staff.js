const router = require('express').Router();
const pool = require('../db');
const auth = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  try { const r = await pool.query('SELECT * FROM staff ORDER BY performance_rating DESC NULLS LAST'); res.json(r.rows); }
  catch (err) { res.status(500).json({ error: err.message }); }
});
router.get('/:id', auth, async (req, res) => {
  try { const r = await pool.query('SELECT * FROM staff WHERE id=$1', [req.params.id]); if (!r.rows.length) return res.status(404).json({ error: 'Not found' }); res.json(r.rows[0]); }
  catch (err) { res.status(500).json({ error: err.message }); }
});
router.post('/', auth, async (req, res) => {
  try {
    const { name, email, phone, role, certification, hire_date, specialization, hourly_rate, is_active, performance_rating, notes } = req.body;
    const r = await pool.query(`INSERT INTO staff (name, email, phone, role, certification, hire_date, specialization, hourly_rate, is_active, performance_rating, notes) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *`,
      [name, email, phone, role, certification, hire_date, specialization, hourly_rate, is_active, performance_rating, notes]);
    res.status(201).json(r.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});
router.put('/:id', auth, async (req, res) => {
  try {
    const { name, email, phone, role, certification, hire_date, specialization, hourly_rate, is_active, performance_rating, notes } = req.body;
    const r = await pool.query(`UPDATE staff SET name=$1, email=$2, phone=$3, role=$4, certification=$5, hire_date=$6, specialization=$7, hourly_rate=$8, is_active=$9, performance_rating=$10, notes=$11, updated_at=NOW() WHERE id=$12 RETURNING *`,
      [name, email, phone, role, certification, hire_date, specialization, hourly_rate, is_active, performance_rating, notes, req.params.id]);
    if (!r.rows.length) return res.status(404).json({ error: 'Not found' }); res.json(r.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});
router.delete('/:id', auth, async (req, res) => {
  try { const r = await pool.query('DELETE FROM staff WHERE id=$1 RETURNING *', [req.params.id]); if (!r.rows.length) return res.status(404).json({ error: 'Not found' }); res.json({ message: 'Deleted' }); }
  catch (err) { res.status(500).json({ error: err.message }); }
});
module.exports = router;
