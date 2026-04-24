const router = require('express').Router();
const pool = require('../db');
const auth = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  try { const r = await pool.query('SELECT * FROM cocktail_recipes ORDER BY created_at DESC'); res.json(r.rows); }
  catch (err) { res.status(500).json({ error: err.message }); }
});
router.get('/:id', auth, async (req, res) => {
  try { const r = await pool.query('SELECT * FROM cocktail_recipes WHERE id=$1', [req.params.id]); if (!r.rows.length) return res.status(404).json({ error: 'Not found' }); res.json(r.rows[0]); }
  catch (err) { res.status(500).json({ error: err.message }); }
});
router.post('/', auth, async (req, res) => {
  try {
    const { name, spirit_base, category, difficulty, prep_time, ingredients, instructions, garnish, glassware, flavor_profile, occasion, notes } = req.body;
    const r = await pool.query(`INSERT INTO cocktail_recipes (name, spirit_base, category, difficulty, prep_time, ingredients, instructions, garnish, glassware, flavor_profile, occasion, notes) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING *`,
      [name, spirit_base, category, difficulty, prep_time, ingredients, instructions, garnish, glassware, flavor_profile, occasion, notes]);
    res.status(201).json(r.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});
router.put('/:id', auth, async (req, res) => {
  try {
    const { name, spirit_base, category, difficulty, prep_time, ingredients, instructions, garnish, glassware, flavor_profile, occasion, notes } = req.body;
    const r = await pool.query(`UPDATE cocktail_recipes SET name=$1, spirit_base=$2, category=$3, difficulty=$4, prep_time=$5, ingredients=$6, instructions=$7, garnish=$8, glassware=$9, flavor_profile=$10, occasion=$11, notes=$12, updated_at=NOW() WHERE id=$13 RETURNING *`,
      [name, spirit_base, category, difficulty, prep_time, ingredients, instructions, garnish, glassware, flavor_profile, occasion, notes, req.params.id]);
    if (!r.rows.length) return res.status(404).json({ error: 'Not found' }); res.json(r.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});
router.delete('/:id', auth, async (req, res) => {
  try { const r = await pool.query('DELETE FROM cocktail_recipes WHERE id=$1 RETURNING *', [req.params.id]); if (!r.rows.length) return res.status(404).json({ error: 'Not found' }); res.json({ message: 'Deleted' }); }
  catch (err) { res.status(500).json({ error: err.message }); }
});
module.exports = router;
