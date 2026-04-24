const router = require('express').Router();
const pool = require('../db');
const auth = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  try { const r = await pool.query('SELECT * FROM purchase_orders ORDER BY order_date DESC'); res.json(r.rows); }
  catch (err) { res.status(500).json({ error: err.message }); }
});
router.get('/:id', auth, async (req, res) => {
  try { const r = await pool.query('SELECT * FROM purchase_orders WHERE id=$1', [req.params.id]); if (!r.rows.length) return res.status(404).json({ error: 'Not found' }); res.json(r.rows[0]); }
  catch (err) { res.status(500).json({ error: err.message }); }
});
router.post('/', auth, async (req, res) => {
  try {
    const { supplier_id, supplier_name, order_number, status, items_description, total_bottles, subtotal, tax, shipping_cost, total_amount, order_date, expected_delivery, approved_by, payment_status, payment_method, notes } = req.body;
    const r = await pool.query(`INSERT INTO purchase_orders (supplier_id, supplier_name, order_number, status, items_description, total_bottles, subtotal, tax, shipping_cost, total_amount, order_date, expected_delivery, approved_by, payment_status, payment_method, notes) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16) RETURNING *`, [supplier_id, supplier_name, order_number, status, items_description, total_bottles, subtotal, tax, shipping_cost, total_amount, order_date, expected_delivery, approved_by, payment_status, payment_method, notes]);
    res.status(201).json(r.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});
router.put('/:id', auth, async (req, res) => {
  try {
    const { supplier_id, supplier_name, order_number, status, items_description, total_bottles, subtotal, tax, shipping_cost, total_amount, order_date, expected_delivery, approved_by, payment_status, payment_method, notes } = req.body;
    const r = await pool.query(`UPDATE purchase_orders SET supplier_id=$1, supplier_name=$2, order_number=$3, status=$4, items_description=$5, total_bottles=$6, subtotal=$7, tax=$8, shipping_cost=$9, total_amount=$10, order_date=$11, expected_delivery=$12, approved_by=$13, payment_status=$14, payment_method=$15, notes=$16 WHERE id=$17 RETURNING *`, [supplier_id, supplier_name, order_number, status, items_description, total_bottles, subtotal, tax, shipping_cost, total_amount, order_date, expected_delivery, approved_by, payment_status, payment_method, notes, req.params.id]);
    if (!r.rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(r.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});
router.delete('/:id', auth, async (req, res) => {
  try { const r = await pool.query('DELETE FROM purchase_orders WHERE id=$1 RETURNING *', [req.params.id]); if (!r.rows.length) return res.status(404).json({ error: 'Not found' }); res.json({ message: 'Deleted' }); }
  catch (err) { res.status(500).json({ error: err.message }); }
});
module.exports = router;
