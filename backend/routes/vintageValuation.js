const router = require('express').Router();
const pool = require('../db');
const auth = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM vintage_valuation ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM vintage_valuation WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', auth, async (req, res) => {
  try {
    const { inventory_id, wine_name, vintage, producer, region, appellation, current_market_value, purchase_price, value_trend, critic_score_ws, critic_score_rp, critic_score_jd, rarity_level, investment_grade, maturity_status, auction_history, notes } = req.body;
    const result = await pool.query(
      `INSERT INTO vintage_valuation (inventory_id, wine_name, vintage, producer, region, appellation, current_market_value, purchase_price, value_trend, critic_score_ws, critic_score_rp, critic_score_jd, rarity_level, investment_grade, maturity_status, auction_history, notes)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17) RETURNING *`,
      [inventory_id, wine_name, vintage, producer, region, appellation, current_market_value, purchase_price, value_trend, critic_score_ws, critic_score_rp, critic_score_jd, rarity_level, investment_grade, maturity_status, auction_history, notes]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const { inventory_id, wine_name, vintage, producer, region, appellation, current_market_value, purchase_price, value_trend, critic_score_ws, critic_score_rp, critic_score_jd, rarity_level, investment_grade, maturity_status, auction_history, notes } = req.body;
    const result = await pool.query(
      `UPDATE vintage_valuation SET inventory_id=$1, wine_name=$2, vintage=$3, producer=$4, region=$5, appellation=$6, current_market_value=$7, purchase_price=$8, value_trend=$9, critic_score_ws=$10, critic_score_rp=$11, critic_score_jd=$12, rarity_level=$13, investment_grade=$14, maturity_status=$15, auction_history=$16, notes=$17, updated_at=NOW()
       WHERE id=$18 RETURNING *`,
      [inventory_id, wine_name, vintage, producer, region, appellation, current_market_value, purchase_price, value_trend, critic_score_ws, critic_score_rp, critic_score_jd, rarity_level, investment_grade, maturity_status, auction_history, notes, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM vintage_valuation WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted successfully' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
