const router = require('express').Router();
const pool = require('../db');
const auth = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  try { const r = await pool.query('SELECT * FROM wine_clubs ORDER BY club_name ASC, membership_tier ASC'); res.json(r.rows); }
  catch (err) { res.status(500).json({ error: err.message }); }
});
router.get('/:id', auth, async (req, res) => {
  try { const r = await pool.query('SELECT * FROM wine_clubs WHERE id=$1', [req.params.id]); if (!r.rows.length) return res.status(404).json({ error: 'Not found' }); res.json(r.rows[0]); }
  catch (err) { res.status(500).json({ error: err.message }); }
});
router.post('/', auth, async (req, res) => {
  try {
    const { club_name, member_name, member_email, member_phone, membership_tier, bottles_per_shipment, shipment_frequency, price_per_shipment, preferences, start_date, renewal_date, is_active, total_shipments, lifetime_value, notes } = req.body;
    const r = await pool.query(`INSERT INTO wine_clubs (club_name, member_name, member_email, member_phone, membership_tier, bottles_per_shipment, shipment_frequency, price_per_shipment, preferences, start_date, renewal_date, is_active, total_shipments, lifetime_value, notes) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15) RETURNING *`,
      [club_name, member_name, member_email, member_phone, membership_tier, bottles_per_shipment, shipment_frequency, price_per_shipment, preferences, start_date, renewal_date, is_active, total_shipments, lifetime_value, notes]);
    res.status(201).json(r.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});
router.put('/:id', auth, async (req, res) => {
  try {
    const { club_name, member_name, member_email, member_phone, membership_tier, bottles_per_shipment, shipment_frequency, price_per_shipment, preferences, start_date, renewal_date, is_active, total_shipments, lifetime_value, notes } = req.body;
    const r = await pool.query(`UPDATE wine_clubs SET club_name=$1, member_name=$2, member_email=$3, member_phone=$4, membership_tier=$5, bottles_per_shipment=$6, shipment_frequency=$7, price_per_shipment=$8, preferences=$9, start_date=$10, renewal_date=$11, is_active=$12, total_shipments=$13, lifetime_value=$14, notes=$15, updated_at=NOW() WHERE id=$16 RETURNING *`,
      [club_name, member_name, member_email, member_phone, membership_tier, bottles_per_shipment, shipment_frequency, price_per_shipment, preferences, start_date, renewal_date, is_active, total_shipments, lifetime_value, notes, req.params.id]);
    if (!r.rows.length) return res.status(404).json({ error: 'Not found' }); res.json(r.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});
router.delete('/:id', auth, async (req, res) => {
  try { const r = await pool.query('DELETE FROM wine_clubs WHERE id=$1 RETURNING *', [req.params.id]); if (!r.rows.length) return res.status(404).json({ error: 'Not found' }); res.json({ message: 'Deleted' }); }
  catch (err) { res.status(500).json({ error: err.message }); }
});
module.exports = router;
