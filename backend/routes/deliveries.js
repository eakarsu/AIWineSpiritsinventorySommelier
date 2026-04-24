const router = require('express').Router();
const pool = require('../db');
const auth = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  try { const r = await pool.query('SELECT * FROM deliveries ORDER BY order_date DESC'); res.json(r.rows); }
  catch (err) { res.status(500).json({ error: err.message }); }
});
router.get('/:id', auth, async (req, res) => {
  try { const r = await pool.query('SELECT * FROM deliveries WHERE id=$1', [req.params.id]); if (!r.rows.length) return res.status(404).json({ error: 'Not found' }); res.json(r.rows[0]); }
  catch (err) { res.status(500).json({ error: err.message }); }
});
router.post('/', auth, async (req, res) => {
  try {
    const { supplier_id, supplier_name, order_number, status, items_description, total_bottles, total_cost, order_date, expected_date, delivered_date, tracking_number, notes } = req.body;
    const r = await pool.query(`INSERT INTO deliveries (supplier_id, supplier_name, order_number, status, items_description, total_bottles, total_cost, order_date, expected_date, delivered_date, tracking_number, notes) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING *`,
      [supplier_id, supplier_name, order_number, status, items_description, total_bottles, total_cost, order_date, expected_date, delivered_date, tracking_number, notes]);
    res.status(201).json(r.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});
router.put('/:id', auth, async (req, res) => {
  try {
    const { supplier_id, supplier_name, order_number, status, items_description, total_bottles, total_cost, order_date, expected_date, delivered_date, tracking_number, notes } = req.body;
    const r = await pool.query(`UPDATE deliveries SET supplier_id=$1, supplier_name=$2, order_number=$3, status=$4, items_description=$5, total_bottles=$6, total_cost=$7, order_date=$8, expected_date=$9, delivered_date=$10, tracking_number=$11, notes=$12, updated_at=NOW() WHERE id=$13 RETURNING *`,
      [supplier_id, supplier_name, order_number, status, items_description, total_bottles, total_cost, order_date, expected_date, delivered_date, tracking_number, notes, req.params.id]);
    if (!r.rows.length) return res.status(404).json({ error: 'Not found' }); res.json(r.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});
router.delete('/:id', auth, async (req, res) => {
  try { const r = await pool.query('DELETE FROM deliveries WHERE id=$1 RETURNING *', [req.params.id]); if (!r.rows.length) return res.status(404).json({ error: 'Not found' }); res.json({ message: 'Deleted' }); }
  catch (err) { res.status(500).json({ error: err.message }); }
});
module.exports = router;
