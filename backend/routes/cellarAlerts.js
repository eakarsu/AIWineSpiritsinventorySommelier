const router = require('express').Router();
const pool = require('../db');
const auth = require('../middleware/auth');

router.get('/stats', auth, async (req, res) => {
  try {
    const result = await pool.query(`SELECT alert_type, severity, COUNT(*) as count FROM cellar_alerts WHERE is_resolved = false GROUP BY alert_type, severity ORDER BY count DESC`);
    const unread = await pool.query(`SELECT COUNT(*) as count FROM cellar_alerts WHERE is_read = false AND is_resolved = false`);
    res.json({ breakdown: result.rows, unread: parseInt(unread.rows[0].count) });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/', auth, async (req, res) => {
  try { const r = await pool.query('SELECT * FROM cellar_alerts ORDER BY triggered_at DESC'); res.json(r.rows); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/:id', auth, async (req, res) => {
  try { const r = await pool.query('SELECT * FROM cellar_alerts WHERE id=$1', [req.params.id]); if (!r.rows.length) return res.status(404).json({ error: 'Not found' }); res.json(r.rows[0]); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', auth, async (req, res) => {
  try {
    const { inventory_id, wine_name, alert_type, severity, message, details } = req.body;
    const r = await pool.query(`INSERT INTO cellar_alerts (inventory_id, wine_name, alert_type, severity, message, details) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`, [inventory_id, wine_name, alert_type, severity, message, details]);
    res.status(201).json(r.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const { inventory_id, wine_name, alert_type, severity, message, details, is_read, is_resolved } = req.body;
    const r = await pool.query(`UPDATE cellar_alerts SET inventory_id=$1, wine_name=$2, alert_type=$3, severity=$4, message=$5, details=$6, is_read=$7, is_resolved=$8 WHERE id=$9 RETURNING *`,
      [inventory_id, wine_name, alert_type, severity, message, details, is_read, is_resolved, req.params.id]);
    if (!r.rows.length) return res.status(404).json({ error: 'Not found' }); res.json(r.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id/read', auth, async (req, res) => {
  try { const r = await pool.query('UPDATE cellar_alerts SET is_read=true WHERE id=$1 RETURNING *', [req.params.id]); res.json(r.rows[0]); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id/resolve', auth, async (req, res) => {
  try { const r = await pool.query('UPDATE cellar_alerts SET is_resolved=true, resolved_at=NOW() WHERE id=$1 RETURNING *', [req.params.id]); res.json(r.rows[0]); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', auth, async (req, res) => {
  try { const r = await pool.query('DELETE FROM cellar_alerts WHERE id=$1 RETURNING *', [req.params.id]); if (!r.rows.length) return res.status(404).json({ error: 'Not found' }); res.json({ message: 'Deleted' }); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
