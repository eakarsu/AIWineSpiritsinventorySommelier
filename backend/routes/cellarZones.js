const router = require('express').Router();
const pool = require('../db');
const auth = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  try { const r = await pool.query('SELECT * FROM cellar_zones ORDER BY zone_name ASC'); res.json(r.rows); }
  catch (err) { res.status(500).json({ error: err.message }); }
});
router.get('/:id', auth, async (req, res) => {
  try { const r = await pool.query('SELECT * FROM cellar_zones WHERE id=$1', [req.params.id]); if (!r.rows.length) return res.status(404).json({ error: 'Not found' }); res.json(r.rows[0]); }
  catch (err) { res.status(500).json({ error: err.message }); }
});
router.post('/', auth, async (req, res) => {
  try {
    const { zone_name, zone_code, zone_type, total_capacity, current_count, target_temp, target_humidity, lighting, rack_type, floor_level, is_active, last_inspected, notes } = req.body;
    const r = await pool.query(`INSERT INTO cellar_zones (zone_name, zone_code, zone_type, total_capacity, current_count, target_temp, target_humidity, lighting, rack_type, floor_level, is_active, last_inspected, notes) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) RETURNING *`,
      [zone_name, zone_code, zone_type, total_capacity, current_count, target_temp, target_humidity, lighting, rack_type, floor_level, is_active, last_inspected, notes]);
    res.status(201).json(r.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});
router.put('/:id', auth, async (req, res) => {
  try {
    const { zone_name, zone_code, zone_type, total_capacity, current_count, target_temp, target_humidity, lighting, rack_type, floor_level, is_active, last_inspected, notes } = req.body;
    const r = await pool.query(`UPDATE cellar_zones SET zone_name=$1, zone_code=$2, zone_type=$3, total_capacity=$4, current_count=$5, target_temp=$6, target_humidity=$7, lighting=$8, rack_type=$9, floor_level=$10, is_active=$11, last_inspected=$12, notes=$13, updated_at=NOW() WHERE id=$14 RETURNING *`,
      [zone_name, zone_code, zone_type, total_capacity, current_count, target_temp, target_humidity, lighting, rack_type, floor_level, is_active, last_inspected, notes, req.params.id]);
    if (!r.rows.length) return res.status(404).json({ error: 'Not found' }); res.json(r.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});
router.delete('/:id', auth, async (req, res) => {
  try { const r = await pool.query('DELETE FROM cellar_zones WHERE id=$1 RETURNING *', [req.params.id]); if (!r.rows.length) return res.status(404).json({ error: 'Not found' }); res.json({ message: 'Deleted' }); }
  catch (err) { res.status(500).json({ error: err.message }); }
});
module.exports = router;
