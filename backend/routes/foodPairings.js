const router = require('express').Router();
const pool = require('../db');
const auth = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM food_pairings ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM food_pairings WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', auth, async (req, res) => {
  try {
    const { inventory_id, wine_name, wine_type, dish_name, cuisine_type, pairing_score, pairing_reason, flavor_bridge, notes } = req.body;
    const result = await pool.query(
      `INSERT INTO food_pairings (inventory_id, wine_name, wine_type, dish_name, cuisine_type, pairing_score, pairing_reason, flavor_bridge, notes)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
      [inventory_id, wine_name, wine_type, dish_name, cuisine_type, pairing_score, pairing_reason, flavor_bridge, notes]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const { inventory_id, wine_name, wine_type, dish_name, cuisine_type, pairing_score, pairing_reason, flavor_bridge, notes } = req.body;
    const result = await pool.query(
      `UPDATE food_pairings SET inventory_id=$1, wine_name=$2, wine_type=$3, dish_name=$4, cuisine_type=$5, pairing_score=$6, pairing_reason=$7, flavor_bridge=$8, notes=$9, updated_at=NOW()
       WHERE id=$10 RETURNING *`,
      [inventory_id, wine_name, wine_type, dish_name, cuisine_type, pairing_score, pairing_reason, flavor_bridge, notes, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM food_pairings WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted successfully' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
