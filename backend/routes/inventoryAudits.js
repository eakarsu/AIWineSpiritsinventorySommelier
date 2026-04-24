const router = require('express').Router();
const pool = require('../db');
const auth = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  try { const r = await pool.query('SELECT * FROM inventory_audits ORDER BY audit_date DESC'); res.json(r.rows); }
  catch (err) { res.status(500).json({ error: err.message }); }
});
router.get('/:id', auth, async (req, res) => {
  try { const r = await pool.query('SELECT * FROM inventory_audits WHERE id=$1', [req.params.id]); if (!r.rows.length) return res.status(404).json({ error: 'Not found' }); res.json(r.rows[0]); }
  catch (err) { res.status(500).json({ error: err.message }); }
});
router.post('/', auth, async (req, res) => {
  try {
    const { audit_date, auditor_name, zone_location, total_items_checked, discrepancies_found, missing_bottles, extra_bottles, damaged_bottles, total_value_variance, status, findings, corrective_actions, notes } = req.body;
    const r = await pool.query(`INSERT INTO inventory_audits (audit_date, auditor_name, zone_location, total_items_checked, discrepancies_found, missing_bottles, extra_bottles, damaged_bottles, total_value_variance, status, findings, corrective_actions, notes) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) RETURNING *`, [audit_date, auditor_name, zone_location, total_items_checked, discrepancies_found, missing_bottles, extra_bottles, damaged_bottles, total_value_variance, status, findings, corrective_actions, notes]);
    res.status(201).json(r.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});
router.put('/:id', auth, async (req, res) => {
  try {
    const { audit_date, auditor_name, zone_location, total_items_checked, discrepancies_found, missing_bottles, extra_bottles, damaged_bottles, total_value_variance, status, findings, corrective_actions, notes } = req.body;
    const r = await pool.query(`UPDATE inventory_audits SET audit_date=$1, auditor_name=$2, zone_location=$3, total_items_checked=$4, discrepancies_found=$5, missing_bottles=$6, extra_bottles=$7, damaged_bottles=$8, total_value_variance=$9, status=$10, findings=$11, corrective_actions=$12, notes=$13 WHERE id=$14 RETURNING *`, [audit_date, auditor_name, zone_location, total_items_checked, discrepancies_found, missing_bottles, extra_bottles, damaged_bottles, total_value_variance, status, findings, corrective_actions, notes, req.params.id]);
    if (!r.rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(r.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});
router.delete('/:id', auth, async (req, res) => {
  try { const r = await pool.query('DELETE FROM inventory_audits WHERE id=$1 RETURNING *', [req.params.id]); if (!r.rows.length) return res.status(404).json({ error: 'Not found' }); res.json({ message: 'Deleted' }); }
  catch (err) { res.status(500).json({ error: err.message }); }
});
module.exports = router;
