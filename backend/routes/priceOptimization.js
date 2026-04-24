const router = require('express').Router();
const pool = require('../db');
const auth = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM price_optimization ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM price_optimization WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', auth, async (req, res) => {
  try {
    const { inventory_id, wine_name, current_retail_price, cost_price, suggested_price, margin_pct, market_avg_price, demand_level, seasonality_factor, competitor_price, price_elasticity, strategy, notes } = req.body;
    const result = await pool.query(
      `INSERT INTO price_optimization (inventory_id, wine_name, current_retail_price, cost_price, suggested_price, margin_pct, market_avg_price, demand_level, seasonality_factor, competitor_price, price_elasticity, strategy, notes)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) RETURNING *`,
      [inventory_id, wine_name, current_retail_price, cost_price, suggested_price, margin_pct, market_avg_price, demand_level, seasonality_factor, competitor_price, price_elasticity, strategy, notes]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const { inventory_id, wine_name, current_retail_price, cost_price, suggested_price, margin_pct, market_avg_price, demand_level, seasonality_factor, competitor_price, price_elasticity, strategy, notes } = req.body;
    const result = await pool.query(
      `UPDATE price_optimization SET inventory_id=$1, wine_name=$2, current_retail_price=$3, cost_price=$4, suggested_price=$5, margin_pct=$6, market_avg_price=$7, demand_level=$8, seasonality_factor=$9, competitor_price=$10, price_elasticity=$11, strategy=$12, notes=$13, updated_at=NOW()
       WHERE id=$14 RETURNING *`,
      [inventory_id, wine_name, current_retail_price, cost_price, suggested_price, margin_pct, market_avg_price, demand_level, seasonality_factor, competitor_price, price_elasticity, strategy, notes, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM price_optimization WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted successfully' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
