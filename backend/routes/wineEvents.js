const router = require('express').Router();
const pool = require('../db');
const auth = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  try { const r = await pool.query('SELECT * FROM wine_events ORDER BY event_date DESC'); res.json(r.rows); }
  catch (err) { res.status(500).json({ error: err.message }); }
});
router.get('/:id', auth, async (req, res) => {
  try { const r = await pool.query('SELECT * FROM wine_events WHERE id=$1', [req.params.id]); if (!r.rows.length) return res.status(404).json({ error: 'Not found' }); res.json(r.rows[0]); }
  catch (err) { res.status(500).json({ error: err.message }); }
});
router.post('/', auth, async (req, res) => {
  try {
    const { title, event_type, event_date, location, description, wines_featured, attendees, cost, revenue, rating, highlights, notes } = req.body;
    const r = await pool.query(`INSERT INTO wine_events (title, event_type, event_date, location, description, wines_featured, attendees, cost, revenue, rating, highlights, notes) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING *`,
      [title, event_type, event_date, location, description, wines_featured, attendees, cost, revenue, rating, highlights, notes]);
    res.status(201).json(r.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});
router.put('/:id', auth, async (req, res) => {
  try {
    const { title, event_type, event_date, location, description, wines_featured, attendees, cost, revenue, rating, highlights, notes } = req.body;
    const r = await pool.query(`UPDATE wine_events SET title=$1, event_type=$2, event_date=$3, location=$4, description=$5, wines_featured=$6, attendees=$7, cost=$8, revenue=$9, rating=$10, highlights=$11, notes=$12, updated_at=NOW() WHERE id=$13 RETURNING *`,
      [title, event_type, event_date, location, description, wines_featured, attendees, cost, revenue, rating, highlights, notes, req.params.id]);
    if (!r.rows.length) return res.status(404).json({ error: 'Not found' }); res.json(r.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});
router.delete('/:id', auth, async (req, res) => {
  try { const r = await pool.query('DELETE FROM wine_events WHERE id=$1 RETURNING *', [req.params.id]); if (!r.rows.length) return res.status(404).json({ error: 'Not found' }); res.json({ message: 'Deleted' }); }
  catch (err) { res.status(500).json({ error: err.message }); }
});
module.exports = router;
