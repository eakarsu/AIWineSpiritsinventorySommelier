const router = require('express').Router();
const pool = require('../db');
const auth = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  try { const r = await pool.query('SELECT * FROM consumption_log ORDER BY consumed_date DESC'); res.json(r.rows); }
  catch (err) { res.status(500).json({ error: err.message }); }
});
router.get('/:id', auth, async (req, res) => {
  try { const r = await pool.query('SELECT * FROM consumption_log WHERE id=$1', [req.params.id]); if (!r.rows.length) return res.status(404).json({ error: 'Not found' }); res.json(r.rows[0]); }
  catch (err) { res.status(500).json({ error: err.message }); }
});
router.post('/', auth, async (req, res) => {
  try {
    const { inventory_id, wine_name, consumed_date, quantity, occasion, served_with, served_to, serving_temp, decanted, decant_time, personal_rating, value_at_consumption, open_method, notes } = req.body;
    const r = await pool.query(`INSERT INTO consumption_log (inventory_id, wine_name, consumed_date, quantity, occasion, served_with, served_to, serving_temp, decanted, decant_time, personal_rating, value_at_consumption, open_method, notes) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14) RETURNING *`,
      [inventory_id, wine_name, consumed_date, quantity, occasion, served_with, served_to, serving_temp, decanted, decant_time, personal_rating, value_at_consumption, open_method, notes]);
    res.status(201).json(r.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});
router.put('/:id', auth, async (req, res) => {
  try {
    const { inventory_id, wine_name, consumed_date, quantity, occasion, served_with, served_to, serving_temp, decanted, decant_time, personal_rating, value_at_consumption, open_method, notes } = req.body;
    const r = await pool.query(`UPDATE consumption_log SET inventory_id=$1, wine_name=$2, consumed_date=$3, quantity=$4, occasion=$5, served_with=$6, served_to=$7, serving_temp=$8, decanted=$9, decant_time=$10, personal_rating=$11, value_at_consumption=$12, open_method=$13, notes=$14, updated_at=NOW() WHERE id=$15 RETURNING *`,
      [inventory_id, wine_name, consumed_date, quantity, occasion, served_with, served_to, serving_temp, decanted, decant_time, personal_rating, value_at_consumption, open_method, notes, req.params.id]);
    if (!r.rows.length) return res.status(404).json({ error: 'Not found' }); res.json(r.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});
router.delete('/:id', auth, async (req, res) => {
  try { const r = await pool.query('DELETE FROM consumption_log WHERE id=$1 RETURNING *', [req.params.id]); if (!r.rows.length) return res.status(404).json({ error: 'Not found' }); res.json({ message: 'Deleted' }); }
  catch (err) { res.status(500).json({ error: err.message }); }
});
module.exports = router;
