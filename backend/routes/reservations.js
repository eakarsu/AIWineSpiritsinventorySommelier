const router = require('express').Router();
const pool = require('../db');
const auth = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  try { const r = await pool.query('SELECT * FROM reservations ORDER BY reservation_date DESC, reservation_time ASC'); res.json(r.rows); }
  catch (err) { res.status(500).json({ error: err.message }); }
});
router.get('/:id', auth, async (req, res) => {
  try { const r = await pool.query('SELECT * FROM reservations WHERE id=$1', [req.params.id]); if (!r.rows.length) return res.status(404).json({ error: 'Not found' }); res.json(r.rows[0]); }
  catch (err) { res.status(500).json({ error: err.message }); }
});
router.post('/', auth, async (req, res) => {
  try {
    const { guest_name, guest_email, guest_phone, party_size, reservation_date, reservation_time, event_type, duration_minutes, room_location, wines_requested, special_requests, status, deposit_amount, deposit_paid, notes } = req.body;
    const r = await pool.query(`INSERT INTO reservations (guest_name, guest_email, guest_phone, party_size, reservation_date, reservation_time, event_type, duration_minutes, room_location, wines_requested, special_requests, status, deposit_amount, deposit_paid, notes) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15) RETURNING *`,
      [guest_name, guest_email, guest_phone, party_size, reservation_date, reservation_time, event_type, duration_minutes, room_location, wines_requested, special_requests, status, deposit_amount, deposit_paid, notes]);
    res.status(201).json(r.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});
router.put('/:id', auth, async (req, res) => {
  try {
    const { guest_name, guest_email, guest_phone, party_size, reservation_date, reservation_time, event_type, duration_minutes, room_location, wines_requested, special_requests, status, deposit_amount, deposit_paid, notes } = req.body;
    const r = await pool.query(`UPDATE reservations SET guest_name=$1, guest_email=$2, guest_phone=$3, party_size=$4, reservation_date=$5, reservation_time=$6, event_type=$7, duration_minutes=$8, room_location=$9, wines_requested=$10, special_requests=$11, status=$12, deposit_amount=$13, deposit_paid=$14, notes=$15, updated_at=NOW() WHERE id=$16 RETURNING *`,
      [guest_name, guest_email, guest_phone, party_size, reservation_date, reservation_time, event_type, duration_minutes, room_location, wines_requested, special_requests, status, deposit_amount, deposit_paid, notes, req.params.id]);
    if (!r.rows.length) return res.status(404).json({ error: 'Not found' }); res.json(r.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});
router.delete('/:id', auth, async (req, res) => {
  try { const r = await pool.query('DELETE FROM reservations WHERE id=$1 RETURNING *', [req.params.id]); if (!r.rows.length) return res.status(404).json({ error: 'Not found' }); res.json({ message: 'Deleted' }); }
  catch (err) { res.status(500).json({ error: err.message }); }
});
module.exports = router;
