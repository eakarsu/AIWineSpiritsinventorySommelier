const router = require('express').Router();
const pool = require('../db');
const auth = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  try { const r = await pool.query('SELECT * FROM expenses ORDER BY expense_date DESC'); res.json(r.rows); }
  catch (err) { res.status(500).json({ error: err.message }); }
});
router.get('/:id', auth, async (req, res) => {
  try { const r = await pool.query('SELECT * FROM expenses WHERE id=$1', [req.params.id]); if (!r.rows.length) return res.status(404).json({ error: 'Not found' }); res.json(r.rows[0]); }
  catch (err) { res.status(500).json({ error: err.message }); }
});
router.post('/', auth, async (req, res) => {
  try {
    const { category, description, amount, expense_date, vendor, payment_method, receipt_number, is_recurring, recurrence_period, budget_category, approved_by, status, notes } = req.body;
    const r = await pool.query(`INSERT INTO expenses (category, description, amount, expense_date, vendor, payment_method, receipt_number, is_recurring, recurrence_period, budget_category, approved_by, status, notes) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) RETURNING *`, [category, description, amount, expense_date, vendor, payment_method, receipt_number, is_recurring, recurrence_period, budget_category, approved_by, status, notes]);
    res.status(201).json(r.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});
router.put('/:id', auth, async (req, res) => {
  try {
    const { category, description, amount, expense_date, vendor, payment_method, receipt_number, is_recurring, recurrence_period, budget_category, approved_by, status, notes } = req.body;
    const r = await pool.query(`UPDATE expenses SET category=$1, description=$2, amount=$3, expense_date=$4, vendor=$5, payment_method=$6, receipt_number=$7, is_recurring=$8, recurrence_period=$9, budget_category=$10, approved_by=$11, status=$12, notes=$13 WHERE id=$14 RETURNING *`, [category, description, amount, expense_date, vendor, payment_method, receipt_number, is_recurring, recurrence_period, budget_category, approved_by, status, notes, req.params.id]);
    if (!r.rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(r.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});
router.delete('/:id', auth, async (req, res) => {
  try { const r = await pool.query('DELETE FROM expenses WHERE id=$1 RETURNING *', [req.params.id]); if (!r.rows.length) return res.status(404).json({ error: 'Not found' }); res.json({ message: 'Deleted' }); }
  catch (err) { res.status(500).json({ error: err.message }); }
});
module.exports = router;
