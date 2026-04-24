const router = require('express').Router();
const pool = require('../db');
const auth = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  try { const r = await pool.query('SELECT * FROM tasting_journal ORDER BY tasting_date DESC'); res.json(r.rows); }
  catch (err) { res.status(500).json({ error: err.message }); }
});
router.get('/:id', auth, async (req, res) => {
  try { const r = await pool.query('SELECT * FROM tasting_journal WHERE id=$1', [req.params.id]); if (!r.rows.length) return res.status(404).json({ error: 'Not found' }); res.json(r.rows[0]); }
  catch (err) { res.status(500).json({ error: err.message }); }
});
router.post('/', auth, async (req, res) => {
  try {
    const { wine_name, inventory_id, tasting_date, occasion, location, companions, appearance_notes, aroma_notes, taste_notes, finish_notes, personal_rating, would_buy_again, price_paid, mood, weather, notes } = req.body;
    const r = await pool.query(`INSERT INTO tasting_journal (wine_name, inventory_id, tasting_date, occasion, location, companions, appearance_notes, aroma_notes, taste_notes, finish_notes, personal_rating, would_buy_again, price_paid, mood, weather, notes) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16) RETURNING *`, [wine_name, inventory_id, tasting_date, occasion, location, companions, appearance_notes, aroma_notes, taste_notes, finish_notes, personal_rating, would_buy_again, price_paid, mood, weather, notes]);
    res.status(201).json(r.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});
router.put('/:id', auth, async (req, res) => {
  try {
    const { wine_name, inventory_id, tasting_date, occasion, location, companions, appearance_notes, aroma_notes, taste_notes, finish_notes, personal_rating, would_buy_again, price_paid, mood, weather, notes } = req.body;
    const r = await pool.query(`UPDATE tasting_journal SET wine_name=$1, inventory_id=$2, tasting_date=$3, occasion=$4, location=$5, companions=$6, appearance_notes=$7, aroma_notes=$8, taste_notes=$9, finish_notes=$10, personal_rating=$11, would_buy_again=$12, price_paid=$13, mood=$14, weather=$15, notes=$16 WHERE id=$17 RETURNING *`, [wine_name, inventory_id, tasting_date, occasion, location, companions, appearance_notes, aroma_notes, taste_notes, finish_notes, personal_rating, would_buy_again, price_paid, mood, weather, notes, req.params.id]);
    if (!r.rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(r.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});
router.delete('/:id', auth, async (req, res) => {
  try { const r = await pool.query('DELETE FROM tasting_journal WHERE id=$1 RETURNING *', [req.params.id]); if (!r.rows.length) return res.status(404).json({ error: 'Not found' }); res.json({ message: 'Deleted' }); }
  catch (err) { res.status(500).json({ error: err.message }); }
});
module.exports = router;
