const router = require('express').Router();
const pool = require('../db');
const auth = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  try { const r = await pool.query('SELECT * FROM maintenance_log ORDER BY maintenance_date DESC'); res.json(r.rows); }
  catch (err) { res.status(500).json({ error: err.message }); }
});
router.get('/:id', auth, async (req, res) => {
  try { const r = await pool.query('SELECT * FROM maintenance_log WHERE id=$1', [req.params.id]); if (!r.rows.length) return res.status(404).json({ error: 'Not found' }); res.json(r.rows[0]); }
  catch (err) { res.status(500).json({ error: err.message }); }
});
router.post('/', auth, async (req, res) => {
  try {
    const { equipment_name, maintenance_type, zone_location, performed_by, maintenance_date, next_due_date, cost, vendor, priority, status, description, parts_replaced, warranty_status, notes } = req.body;
    const r = await pool.query(`INSERT INTO maintenance_log (equipment_name, maintenance_type, zone_location, performed_by, maintenance_date, next_due_date, cost, vendor, priority, status, description, parts_replaced, warranty_status, notes) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14) RETURNING *`,
      [equipment_name, maintenance_type, zone_location, performed_by, maintenance_date, next_due_date, cost, vendor, priority, status, description, parts_replaced, warranty_status, notes]);
    res.status(201).json(r.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});
router.put('/:id', auth, async (req, res) => {
  try {
    const { equipment_name, maintenance_type, zone_location, performed_by, maintenance_date, next_due_date, cost, vendor, priority, status, description, parts_replaced, warranty_status, notes } = req.body;
    const r = await pool.query(`UPDATE maintenance_log SET equipment_name=$1, maintenance_type=$2, zone_location=$3, performed_by=$4, maintenance_date=$5, next_due_date=$6, cost=$7, vendor=$8, priority=$9, status=$10, description=$11, parts_replaced=$12, warranty_status=$13, notes=$14, updated_at=NOW() WHERE id=$15 RETURNING *`,
      [equipment_name, maintenance_type, zone_location, performed_by, maintenance_date, next_due_date, cost, vendor, priority, status, description, parts_replaced, warranty_status, notes, req.params.id]);
    if (!r.rows.length) return res.status(404).json({ error: 'Not found' }); res.json(r.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});
router.delete('/:id', auth, async (req, res) => {
  try { const r = await pool.query('DELETE FROM maintenance_log WHERE id=$1 RETURNING *', [req.params.id]); if (!r.rows.length) return res.status(404).json({ error: 'Not found' }); res.json({ message: 'Deleted' }); }
  catch (err) { res.status(500).json({ error: err.message }); }
});
module.exports = router;
