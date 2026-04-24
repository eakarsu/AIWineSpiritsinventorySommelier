const router = require('express').Router();
const pool = require('../db');
const auth = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM tasting_notes ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM tasting_notes WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', auth, async (req, res) => {
  try {
    const { inventory_id, wine_name, taster_name, date_tasted, appearance, nose, palate, finish, overall_rating, notes } = req.body;
    const result = await pool.query(
      `INSERT INTO tasting_notes (inventory_id, wine_name, taster_name, date_tasted, appearance, nose, palate, finish, overall_rating, notes)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
      [inventory_id, wine_name, taster_name, date_tasted, appearance, nose, palate, finish, overall_rating, notes]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const { inventory_id, wine_name, taster_name, date_tasted, appearance, nose, palate, finish, overall_rating, notes } = req.body;
    const result = await pool.query(
      `UPDATE tasting_notes SET inventory_id=$1, wine_name=$2, taster_name=$3, date_tasted=$4, appearance=$5, nose=$6, palate=$7, finish=$8, overall_rating=$9, notes=$10, updated_at=NOW()
       WHERE id=$11 RETURNING *`,
      [inventory_id, wine_name, taster_name, date_tasted, appearance, nose, palate, finish, overall_rating, notes, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM tasting_notes WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted successfully' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
