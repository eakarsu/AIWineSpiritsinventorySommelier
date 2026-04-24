const router = require('express').Router();
const pool = require('../db');
const auth = require('../middleware/auth');

router.get('/stats/summary', auth, async (req, res) => {
  try {
    const r = await pool.query(`SELECT COUNT(*) as total_sales, SUM(total_amount) as total_revenue, SUM(profit) as total_profit, AVG(total_amount) as avg_sale FROM sales`);
    res.json(r.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/', auth, async (req, res) => {
  try { const r = await pool.query('SELECT * FROM sales ORDER BY sale_date DESC'); res.json(r.rows); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/:id', auth, async (req, res) => {
  try { const r = await pool.query('SELECT * FROM sales WHERE id=$1', [req.params.id]); if (!r.rows.length) return res.status(404).json({ error: 'Not found' }); res.json(r.rows[0]); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', auth, async (req, res) => {
  try {
    const { inventory_id, wine_name, customer_name, customer_type, quantity_sold, unit_price, total_amount, cost_basis, profit, sale_type, sale_date, payment_method, notes } = req.body;
    const r = await pool.query(`INSERT INTO sales (inventory_id, wine_name, customer_name, customer_type, quantity_sold, unit_price, total_amount, cost_basis, profit, sale_type, sale_date, payment_method, notes) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) RETURNING *`,
      [inventory_id, wine_name, customer_name, customer_type, quantity_sold, unit_price, total_amount, cost_basis, profit, sale_type, sale_date, payment_method, notes]);
    res.status(201).json(r.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const { inventory_id, wine_name, customer_name, customer_type, quantity_sold, unit_price, total_amount, cost_basis, profit, sale_type, sale_date, payment_method, notes } = req.body;
    const r = await pool.query(`UPDATE sales SET inventory_id=$1, wine_name=$2, customer_name=$3, customer_type=$4, quantity_sold=$5, unit_price=$6, total_amount=$7, cost_basis=$8, profit=$9, sale_type=$10, sale_date=$11, payment_method=$12, notes=$13, updated_at=NOW() WHERE id=$14 RETURNING *`,
      [inventory_id, wine_name, customer_name, customer_type, quantity_sold, unit_price, total_amount, cost_basis, profit, sale_type, sale_date, payment_method, notes, req.params.id]);
    if (!r.rows.length) return res.status(404).json({ error: 'Not found' }); res.json(r.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', auth, async (req, res) => {
  try { const r = await pool.query('DELETE FROM sales WHERE id=$1 RETURNING *', [req.params.id]); if (!r.rows.length) return res.status(404).json({ error: 'Not found' }); res.json({ message: 'Deleted' }); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
