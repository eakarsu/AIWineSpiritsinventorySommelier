const router = require('express').Router();
const pool = require('../db');
const auth = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  try { const r = await pool.query('SELECT * FROM suppliers ORDER BY rating DESC NULLS LAST'); res.json(r.rows); }
  catch (err) { res.status(500).json({ error: err.message }); }
});
router.get('/:id', auth, async (req, res) => {
  try { const r = await pool.query('SELECT * FROM suppliers WHERE id=$1', [req.params.id]); if (!r.rows.length) return res.status(404).json({ error: 'Not found' }); res.json(r.rows[0]); }
  catch (err) { res.status(500).json({ error: err.message }); }
});
router.post('/', auth, async (req, res) => {
  try {
    const { company_name, contact_name, email, phone, address, city, country, specialization, rating, payment_terms, minimum_order, lead_time_days, is_active, notes } = req.body;
    const r = await pool.query(`INSERT INTO suppliers (company_name, contact_name, email, phone, address, city, country, specialization, rating, payment_terms, minimum_order, lead_time_days, is_active, notes) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14) RETURNING *`,
      [company_name, contact_name, email, phone, address, city, country, specialization, rating, payment_terms, minimum_order, lead_time_days, is_active, notes]);
    res.status(201).json(r.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});
router.put('/:id', auth, async (req, res) => {
  try {
    const { company_name, contact_name, email, phone, address, city, country, specialization, rating, payment_terms, minimum_order, lead_time_days, is_active, notes } = req.body;
    const r = await pool.query(`UPDATE suppliers SET company_name=$1, contact_name=$2, email=$3, phone=$4, address=$5, city=$6, country=$7, specialization=$8, rating=$9, payment_terms=$10, minimum_order=$11, lead_time_days=$12, is_active=$13, notes=$14, updated_at=NOW() WHERE id=$15 RETURNING *`,
      [company_name, contact_name, email, phone, address, city, country, specialization, rating, payment_terms, minimum_order, lead_time_days, is_active, notes, req.params.id]);
    if (!r.rows.length) return res.status(404).json({ error: 'Not found' }); res.json(r.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});
router.delete('/:id', auth, async (req, res) => {
  try { const r = await pool.query('DELETE FROM suppliers WHERE id=$1 RETURNING *', [req.params.id]); if (!r.rows.length) return res.status(404).json({ error: 'Not found' }); res.json({ message: 'Deleted' }); }
  catch (err) { res.status(500).json({ error: err.message }); }
});
module.exports = router;
