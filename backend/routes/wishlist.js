const router = require('express').Router();
const pool = require('../db');
const auth = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  try { const r = await pool.query('SELECT * FROM wishlist ORDER BY CASE priority WHEN \'high\' THEN 1 WHEN \'medium\' THEN 2 ELSE 3 END, created_at DESC'); res.json(r.rows); }
  catch (err) { res.status(500).json({ error: err.message }); }
});
router.get('/:id', auth, async (req, res) => {
  try { const r = await pool.query('SELECT * FROM wishlist WHERE id=$1', [req.params.id]); if (!r.rows.length) return res.status(404).json({ error: 'Not found' }); res.json(r.rows[0]); }
  catch (err) { res.status(500).json({ error: err.message }); }
});
router.post('/', auth, async (req, res) => {
  try {
    const { wine_name, producer, vintage, region, country, estimated_price, priority, reason, source, target_quantity, status, notes } = req.body;
    const r = await pool.query(`INSERT INTO wishlist (wine_name, producer, vintage, region, country, estimated_price, priority, reason, source, target_quantity, status, notes) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING *`,
      [wine_name, producer, vintage, region, country, estimated_price, priority, reason, source, target_quantity, status, notes]);
    res.status(201).json(r.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});
router.put('/:id', auth, async (req, res) => {
  try {
    const { wine_name, producer, vintage, region, country, estimated_price, priority, reason, source, target_quantity, status, notes } = req.body;
    const r = await pool.query(`UPDATE wishlist SET wine_name=$1, producer=$2, vintage=$3, region=$4, country=$5, estimated_price=$6, priority=$7, reason=$8, source=$9, target_quantity=$10, status=$11, notes=$12, updated_at=NOW() WHERE id=$13 RETURNING *`,
      [wine_name, producer, vintage, region, country, estimated_price, priority, reason, source, target_quantity, status, notes, req.params.id]);
    if (!r.rows.length) return res.status(404).json({ error: 'Not found' }); res.json(r.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});
router.delete('/:id', auth, async (req, res) => {
  try { const r = await pool.query('DELETE FROM wishlist WHERE id=$1 RETURNING *', [req.params.id]); if (!r.rows.length) return res.status(404).json({ error: 'Not found' }); res.json({ message: 'Deleted' }); }
  catch (err) { res.status(500).json({ error: err.message }); }
});
module.exports = router;
