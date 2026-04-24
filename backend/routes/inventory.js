const router = require('express').Router();
const pool = require('../db');
const auth = require('../middleware/auth');

// Stats (must be before /:id)
router.get('/stats/summary', auth, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        COUNT(*) as total_items,
        SUM(quantity) as total_bottles,
        SUM(current_value * quantity) as total_value,
        COUNT(DISTINCT type) as types,
        COUNT(DISTINCT country) as countries
      FROM inventory
    `);
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Get all
router.get('/', auth, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM inventory ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Get one
router.get('/:id', auth, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM inventory WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Create
router.post('/', auth, async (req, res) => {
  try {
    const { name, type, category, region, country, vintage, producer, alcohol_pct, quantity, bottle_size, purchase_price, current_value, location, rack_position, drink_window_start, drink_window_end, notes } = req.body;
    const result = await pool.query(
      `INSERT INTO inventory (name, type, category, region, country, vintage, producer, alcohol_pct, quantity, bottle_size, purchase_price, current_value, location, rack_position, drink_window_start, drink_window_end, notes)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17) RETURNING *`,
      [name, type, category, region, country, vintage, producer, alcohol_pct, quantity, bottle_size, purchase_price, current_value, location, rack_position, drink_window_start, drink_window_end, notes]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Update
router.put('/:id', auth, async (req, res) => {
  try {
    const { name, type, category, region, country, vintage, producer, alcohol_pct, quantity, bottle_size, purchase_price, current_value, location, rack_position, drink_window_start, drink_window_end, notes } = req.body;
    const result = await pool.query(
      `UPDATE inventory SET name=$1, type=$2, category=$3, region=$4, country=$5, vintage=$6, producer=$7, alcohol_pct=$8, quantity=$9, bottle_size=$10, purchase_price=$11, current_value=$12, location=$13, rack_position=$14, drink_window_start=$15, drink_window_end=$16, notes=$17, updated_at=NOW()
       WHERE id=$18 RETURNING *`,
      [name, type, category, region, country, vintage, producer, alcohol_pct, quantity, bottle_size, purchase_price, current_value, location, rack_position, drink_window_start, drink_window_end, notes, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Delete
router.delete('/:id', auth, async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM inventory WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted successfully' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
