// Custom Views — 4 endpoints
//  VIZ-1: GET /inventory-turn         — inventory turn / velocity by item
//  VIZ-2: GET /varietal-region-heatmap — varietal x region popularity heatmap data
//  NV-1 : GET /cellar-list-pdf        — printable cellar list PDF
//  NV-2 : CRUD /rules                  — pairing rules + reorder-point rules editor

const router = require('express').Router();
const pool = require('../db');
const auth = require('../middleware/auth');
const PDFDocument = require('pdfkit');

// -------- bootstrap (idempotent) --------
async function ensureRulesTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS custom_view_rules (
      id SERIAL PRIMARY KEY,
      rule_type VARCHAR(50) NOT NULL,            -- 'pairing' | 'reorder'
      name VARCHAR(255) NOT NULL,
      -- pairing fields
      varietal VARCHAR(255),
      cuisine VARCHAR(255),
      dish VARCHAR(255),
      pairing_score INTEGER,
      notes TEXT,
      -- reorder fields
      inventory_id INTEGER,
      wine_name VARCHAR(255),
      reorder_point INTEGER,
      reorder_qty INTEGER,
      supplier VARCHAR(255),
      is_active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
}
ensureRulesTable().catch((e) => console.error('[customViews] bootstrap:', e.message));

// =====================================================================
// VIZ-1: inventory turn — last 90d sales velocity vs on-hand qty
// =====================================================================
router.get('/inventory-turn', auth, async (req, res) => {
  try {
    const inv = await pool.query(
      `SELECT id, name, type, region, country, vintage, quantity,
              COALESCE(current_value,0) AS current_value
         FROM inventory ORDER BY name`
    );

    // sales — schema has wine_name + inventory_id; tolerate sparse data
    let salesRows = [];
    try {
      const s = await pool.query(
        `SELECT inventory_id, wine_name,
                COALESCE(SUM(quantity_sold),0) AS units_sold,
                COALESCE(SUM(total_amount),0) AS revenue
           FROM sales
          WHERE sale_date >= CURRENT_DATE - INTERVAL '90 days'
          GROUP BY inventory_id, wine_name`
      );
      salesRows = s.rows;
    } catch (_) { salesRows = []; }

    const byId = new Map();
    const byName = new Map();
    salesRows.forEach((r) => {
      if (r.inventory_id) byId.set(r.inventory_id, r);
      if (r.wine_name) byName.set(String(r.wine_name).toLowerCase(), r);
    });

    const items = inv.rows.map((it) => {
      const m = byId.get(it.id) || byName.get(String(it.name).toLowerCase()) || {};
      const units_sold_90d = Number(m.units_sold || 0);
      const revenue_90d = Number(m.revenue || 0);
      const on_hand = Number(it.quantity || 0);
      // monthly velocity; turns/yr = (12 * monthly) / on_hand
      const monthly_velocity = units_sold_90d / 3;
      const turns_per_year = on_hand > 0 ? (monthly_velocity * 12) / on_hand : 0;
      const days_of_supply = monthly_velocity > 0 ? Math.round(on_hand / (monthly_velocity / 30)) : null;
      return {
        id: it.id,
        name: it.name,
        type: it.type,
        region: it.region,
        country: it.country,
        vintage: it.vintage,
        on_hand,
        units_sold_90d,
        revenue_90d,
        monthly_velocity: Number(monthly_velocity.toFixed(2)),
        turns_per_year: Number(turns_per_year.toFixed(2)),
        days_of_supply,
        velocity_class:
          turns_per_year >= 4 ? 'fast'
          : turns_per_year >= 1 ? 'normal'
          : turns_per_year > 0 ? 'slow'
          : 'stale',
      };
    });

    const summary = {
      total_items: items.length,
      total_on_hand: items.reduce((s, x) => s + x.on_hand, 0),
      total_units_sold_90d: items.reduce((s, x) => s + x.units_sold_90d, 0),
      total_revenue_90d: items.reduce((s, x) => s + x.revenue_90d, 0),
      fast_movers: items.filter((x) => x.velocity_class === 'fast').length,
      slow_movers: items.filter((x) => x.velocity_class === 'slow').length,
      stale: items.filter((x) => x.velocity_class === 'stale').length,
    };

    res.json({ summary, items });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =====================================================================
// VIZ-2: varietal x region popularity heatmap
// rows = varietal (inventory.type),  cols = region,  cell = popularity score
// popularity = bottles_on_hand + 2*units_sold_90d  (sales weighted)
// =====================================================================
router.get('/varietal-region-heatmap', auth, async (req, res) => {
  try {
    const inv = await pool.query(
      `SELECT COALESCE(type,'Unknown') AS varietal,
              COALESCE(region,'Unknown') AS region,
              SUM(COALESCE(quantity,0))::int AS bottles
         FROM inventory
        GROUP BY varietal, region`
    );

    let salesAgg = [];
    try {
      const s = await pool.query(`
        SELECT COALESCE(i.type,'Unknown') AS varietal,
               COALESCE(i.region,'Unknown') AS region,
               COALESCE(SUM(s.quantity_sold),0)::int AS units_sold
          FROM sales s
          LEFT JOIN inventory i ON s.inventory_id = i.id
         WHERE s.sale_date >= CURRENT_DATE - INTERVAL '180 days'
         GROUP BY varietal, region
      `);
      salesAgg = s.rows;
    } catch (_) { salesAgg = []; }

    const varietalSet = new Set();
    const regionSet = new Set();
    const cellMap = new Map(); // key `${varietal}||${region}` -> {bottles, units_sold}

    inv.rows.forEach((r) => {
      varietalSet.add(r.varietal);
      regionSet.add(r.region);
      const k = `${r.varietal}||${r.region}`;
      const cur = cellMap.get(k) || { bottles: 0, units_sold: 0 };
      cur.bottles += Number(r.bottles || 0);
      cellMap.set(k, cur);
    });
    salesAgg.forEach((r) => {
      varietalSet.add(r.varietal);
      regionSet.add(r.region);
      const k = `${r.varietal}||${r.region}`;
      const cur = cellMap.get(k) || { bottles: 0, units_sold: 0 };
      cur.units_sold += Number(r.units_sold || 0);
      cellMap.set(k, cur);
    });

    const varietals = Array.from(varietalSet).sort();
    const regions = Array.from(regionSet).sort();

    const cells = [];
    let maxScore = 0;
    varietals.forEach((v) => {
      regions.forEach((r) => {
        const c = cellMap.get(`${v}||${r}`) || { bottles: 0, units_sold: 0 };
        const score = c.bottles + 2 * c.units_sold;
        if (score > maxScore) maxScore = score;
        cells.push({
          varietal: v,
          region: r,
          bottles: c.bottles,
          units_sold_180d: c.units_sold,
          score,
        });
      });
    });

    res.json({
      varietals,
      regions,
      cells,
      max_score: maxScore,
      generated_at: new Date().toISOString(),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =====================================================================
// NV-1: cellar list PDF
// =====================================================================
router.get('/cellar-list-pdf', auth, async (req, res) => {
  try {
    const inv = await pool.query(
      `SELECT name, type, region, country, vintage, producer, quantity,
              bottle_size, location, rack_position,
              COALESCE(current_value,0) AS current_value
         FROM inventory
        ORDER BY type, region NULLS LAST, name`
    );

    const doc = new PDFDocument({ size: 'LETTER', margin: 40 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="cellar-list.pdf"');
    doc.pipe(res);

    // header
    doc.fontSize(18).fillColor('#722f37').text('Cellar List Report', { align: 'left' });
    doc.fontSize(10).fillColor('#555')
       .text(`Generated: ${new Date().toLocaleString()}`)
       .text(`Total items: ${inv.rows.length}    Total bottles: ${inv.rows.reduce((s, r) => s + Number(r.quantity || 0), 0)}`);
    doc.moveDown(0.5);
    doc.moveTo(40, doc.y).lineTo(572, doc.y).strokeColor('#c9a96e').stroke();
    doc.moveDown(0.5);

    // column header
    const cols = [
      { k: 'name',          w: 150, h: 'Wine' },
      { k: 'type',          w: 70,  h: 'Type' },
      { k: 'region',        w: 90,  h: 'Region' },
      { k: 'vintage',       w: 45,  h: 'Vintage' },
      { k: 'quantity',      w: 35,  h: 'Qty' },
      { k: 'location',      w: 80,  h: 'Location' },
      { k: 'current_value', w: 60,  h: 'Value', money: true },
    ];

    const drawRow = (row, opts = {}) => {
      const y = doc.y;
      let x = 40;
      const bold = !!opts.header;
      cols.forEach((c) => {
        let v = row[c.k];
        if (c.money) v = '$' + Number(v || 0).toFixed(2);
        if (v === null || v === undefined) v = '';
        doc.fontSize(bold ? 9 : 8)
           .fillColor(bold ? '#722f37' : '#222')
           .font(bold ? 'Helvetica-Bold' : 'Helvetica')
           .text(String(v), x + 2, y + 2, { width: c.w - 4, ellipsis: true });
        x += c.w;
      });
      doc.y = y + (bold ? 16 : 14);
    };

    drawRow(Object.fromEntries(cols.map((c) => [c.k, c.h])), { header: true });
    doc.moveTo(40, doc.y).lineTo(572, doc.y).strokeColor('#ddd').stroke();

    inv.rows.forEach((r, i) => {
      if (doc.y > 720) {
        doc.addPage();
        drawRow(Object.fromEntries(cols.map((c) => [c.k, c.h])), { header: true });
        doc.moveTo(40, doc.y).lineTo(572, doc.y).strokeColor('#ddd').stroke();
      }
      drawRow(r);
      if (i % 2 === 1) {
        // light zebra divider
        doc.moveTo(40, doc.y).lineTo(572, doc.y).strokeColor('#f3f3f3').stroke();
      }
    });

    doc.end();
  } catch (err) {
    if (!res.headersSent) res.status(500).json({ error: err.message });
  }
});

// =====================================================================
// NV-2: rules CRUD — pairing rules + reorder-point rules
// =====================================================================
router.get('/rules', auth, async (req, res) => {
  try {
    const { rule_type } = req.query;
    const params = [];
    let where = '';
    if (rule_type) { params.push(rule_type); where = 'WHERE rule_type = $1'; }
    const r = await pool.query(
      `SELECT * FROM custom_view_rules ${where} ORDER BY rule_type, name`,
      params
    );
    res.json(r.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/rules', auth, async (req, res) => {
  try {
    const {
      rule_type, name,
      varietal, cuisine, dish, pairing_score, notes,
      inventory_id, wine_name, reorder_point, reorder_qty, supplier,
      is_active,
    } = req.body;
    if (!rule_type || !name) return res.status(400).json({ error: 'rule_type and name required' });
    const r = await pool.query(
      `INSERT INTO custom_view_rules
        (rule_type, name, varietal, cuisine, dish, pairing_score, notes,
         inventory_id, wine_name, reorder_point, reorder_qty, supplier, is_active)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12, COALESCE($13,TRUE))
       RETURNING *`,
      [rule_type, name, varietal, cuisine, dish, pairing_score, notes,
       inventory_id, wine_name, reorder_point, reorder_qty, supplier, is_active]
    );
    res.status(201).json(r.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/rules/:id', auth, async (req, res) => {
  try {
    const {
      rule_type, name,
      varietal, cuisine, dish, pairing_score, notes,
      inventory_id, wine_name, reorder_point, reorder_qty, supplier,
      is_active,
    } = req.body;
    const r = await pool.query(
      `UPDATE custom_view_rules SET
         rule_type=$1, name=$2, varietal=$3, cuisine=$4, dish=$5,
         pairing_score=$6, notes=$7, inventory_id=$8, wine_name=$9,
         reorder_point=$10, reorder_qty=$11, supplier=$12,
         is_active=COALESCE($13, is_active), updated_at=NOW()
       WHERE id=$14 RETURNING *`,
      [rule_type, name, varietal, cuisine, dish, pairing_score, notes,
       inventory_id, wine_name, reorder_point, reorder_qty, supplier,
       is_active, req.params.id]
    );
    if (r.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(r.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/rules/:id', auth, async (req, res) => {
  try {
    const r = await pool.query('DELETE FROM custom_view_rules WHERE id=$1 RETURNING *', [req.params.id]);
    if (r.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
