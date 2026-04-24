const router = require('express').Router();
const pool = require('../db');
const auth = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  try { const r = await pool.query('SELECT * FROM wine_labels ORDER BY created_at DESC'); res.json(r.rows); }
  catch (err) { res.status(500).json({ error: err.message }); }
});
router.get('/:id', auth, async (req, res) => {
  try { const r = await pool.query('SELECT * FROM wine_labels WHERE id=$1', [req.params.id]); if (!r.rows.length) return res.status(404).json({ error: 'Not found' }); res.json(r.rows[0]); }
  catch (err) { res.status(500).json({ error: err.message }); }
});
router.post('/', auth, async (req, res) => {
  try {
    const { inventory_id, wine_name, producer, vintage, region, country, label_image_url, back_label_url, bottle_photo_url, design_notes, label_condition, is_favorite, tags, notes } = req.body;
    const r = await pool.query(`INSERT INTO wine_labels (inventory_id, wine_name, producer, vintage, region, country, label_image_url, back_label_url, bottle_photo_url, design_notes, label_condition, is_favorite, tags, notes) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14) RETURNING *`, [inventory_id, wine_name, producer, vintage, region, country, label_image_url, back_label_url, bottle_photo_url, design_notes, label_condition, is_favorite, tags, notes]);
    res.status(201).json(r.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});
router.put('/:id', auth, async (req, res) => {
  try {
    const { inventory_id, wine_name, producer, vintage, region, country, label_image_url, back_label_url, bottle_photo_url, design_notes, label_condition, is_favorite, tags, notes } = req.body;
    const r = await pool.query(`UPDATE wine_labels SET inventory_id=$1, wine_name=$2, producer=$3, vintage=$4, region=$5, country=$6, label_image_url=$7, back_label_url=$8, bottle_photo_url=$9, design_notes=$10, label_condition=$11, is_favorite=$12, tags=$13, notes=$14 WHERE id=$15 RETURNING *`, [inventory_id, wine_name, producer, vintage, region, country, label_image_url, back_label_url, bottle_photo_url, design_notes, label_condition, is_favorite, tags, notes, req.params.id]);
    if (!r.rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(r.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});
router.delete('/:id', auth, async (req, res) => {
  try { const r = await pool.query('DELETE FROM wine_labels WHERE id=$1 RETURNING *', [req.params.id]); if (!r.rows.length) return res.status(404).json({ error: 'Not found' }); res.json({ message: 'Deleted' }); }
  catch (err) { res.status(500).json({ error: err.message }); }
});
module.exports = router;
