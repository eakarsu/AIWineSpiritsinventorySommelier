const router = require('express').Router();
const pool = require('../db');
const auth = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  try { const r = await pool.query('SELECT * FROM customers ORDER BY total_purchases DESC'); res.json(r.rows); }
  catch (err) { res.status(500).json({ error: err.message }); }
});
router.get('/:id', auth, async (req, res) => {
  try { const r = await pool.query('SELECT * FROM customers WHERE id=$1', [req.params.id]); if (!r.rows.length) return res.status(404).json({ error: 'Not found' }); res.json(r.rows[0]); }
  catch (err) { res.status(500).json({ error: err.message }); }
});
router.post('/', auth, async (req, res) => {
  try {
    const { name, email, phone, customer_type, company, preferences, favorite_regions, favorite_varietals, budget_range, total_purchases, visit_count, last_visit, vip_status, notes } = req.body;
    const r = await pool.query(`INSERT INTO customers (name, email, phone, customer_type, company, preferences, favorite_regions, favorite_varietals, budget_range, total_purchases, visit_count, last_visit, vip_status, notes) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14) RETURNING *`,
      [name, email, phone, customer_type, company, preferences, favorite_regions, favorite_varietals, budget_range, total_purchases, visit_count, last_visit, vip_status, notes]);
    res.status(201).json(r.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});
router.put('/:id', auth, async (req, res) => {
  try {
    const { name, email, phone, customer_type, company, preferences, favorite_regions, favorite_varietals, budget_range, total_purchases, visit_count, last_visit, vip_status, notes } = req.body;
    const r = await pool.query(`UPDATE customers SET name=$1, email=$2, phone=$3, customer_type=$4, company=$5, preferences=$6, favorite_regions=$7, favorite_varietals=$8, budget_range=$9, total_purchases=$10, visit_count=$11, last_visit=$12, vip_status=$13, notes=$14, updated_at=NOW() WHERE id=$15 RETURNING *`,
      [name, email, phone, customer_type, company, preferences, favorite_regions, favorite_varietals, budget_range, total_purchases, visit_count, last_visit, vip_status, notes, req.params.id]);
    if (!r.rows.length) return res.status(404).json({ error: 'Not found' }); res.json(r.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});
router.delete('/:id', auth, async (req, res) => {
  try { const r = await pool.query('DELETE FROM customers WHERE id=$1 RETURNING *', [req.params.id]); if (!r.rows.length) return res.status(404).json({ error: 'Not found' }); res.json({ message: 'Deleted' }); }
  catch (err) { res.status(500).json({ error: err.message }); }
});
module.exports = router;
