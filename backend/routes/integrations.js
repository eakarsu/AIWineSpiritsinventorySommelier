// Apply pass 5 — deferred-backlog integrations route.
//
// Implements the items previously deferred in _AUDIT_NOTE.md as additive,
// non-breaking endpoints. All new tables use CREATE TABLE IF NOT EXISTS.
// Existing routes/schemas are not modified.
//
// Categories:
//  - NEEDS-CREDS:
//      Restaurant POS menu pull (TOAST_API_KEY / SQUARE_API_KEY)
//      Distributor auto-reorder (SOUTHERNGLAZER_API_KEY / RNDC_API_KEY)
//  - NEEDS-PRODUCT-DECISION:
//      Sommelier certification module
//        PRODUCT-DECISION: 4-tier static curriculum (Level 1/2/3/Master),
//        progress is self-attested + quiz_score; no proctoring; no upstream
//        cert authority. Operator may swap when a partnership lands.
//  - MECHANICAL:
//      Restaurant menu pairings — given a menu list, return per-item wine
//      pairings using the existing AI helper or a static fallback.

const router = require('express').Router();
const pool = require('../db');
const auth = require('../middleware/auth');
const https = require('https');

// Local AI key gate so we never hit OpenRouter without credentials.
function aiKeyMissing() {
  const k = process.env.OPENROUTER_API_KEY;
  return !k || k === 'your_openrouter_api_key_here';
}

async function callOpenRouter(prompt, systemPrompt) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  const model = process.env.OPENROUTER_MODEL || 'anthropic/claude-haiku-4.5';
  const body = JSON.stringify({
    model,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: prompt },
    ],
    max_tokens: 1500,
    temperature: 0.6,
  });
  return new Promise((resolve, reject) => {
    const opts = {
      hostname: 'openrouter.ai',
      path: '/api/v1/chat/completions',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'http://localhost:3000',
        'X-Title': 'Wine Sommelier — backlog',
      },
    };
    const req = https.request(opts, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (parsed.error) reject(new Error(parsed.error.message || 'OpenRouter error'));
          else resolve(parsed.choices[0].message.content);
        } catch (e) { reject(new Error('Failed to parse AI response')); }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

// Bootstrap additive schema (per-request lazy init).
let TABLES_READY = false;
async function ensureTables() {
  if (TABLES_READY) return;
  await pool.query(`
    CREATE TABLE IF NOT EXISTS sommelier_courses (
      id SERIAL PRIMARY KEY,
      level VARCHAR(20) NOT NULL,
      title VARCHAR(160) NOT NULL,
      summary TEXT,
      modules INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS sommelier_progress (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL,
      course_id INTEGER REFERENCES sommelier_courses(id),
      modules_completed INTEGER DEFAULT 0,
      quiz_score NUMERIC(5,2),
      certified_at TIMESTAMP,
      UNIQUE (user_id, course_id)
    )
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS distributor_orders (
      id SERIAL PRIMARY KEY,
      provider VARCHAR(60),
      status VARCHAR(40) DEFAULT 'queued',
      payload TEXT,
      external_id VARCHAR(120),
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);
  // Seed builtin curriculum once.
  const c = await pool.query('SELECT COUNT(*)::int AS n FROM sommelier_courses');
  if (c.rows[0].n === 0) {
    const seeds = [
      ['L1', 'Level 1 — Wine Foundations', 'Grape varieties, basic terroir, tasting vocabulary.', 6],
      ['L2', 'Level 2 — Regions & Pairing', 'Old vs. new world, pairing principles, service.', 8],
      ['L3', 'Level 3 — Advanced Sommelier', 'Blind tasting, wine list construction, cellar mgmt.', 10],
      ['MASTER', 'Master Track', 'Self-study research projects + mentorship.', 12],
    ];
    for (const [level, title, summary, modules] of seeds) {
      await pool.query(
        'INSERT INTO sommelier_courses (level, title, summary, modules) VALUES ($1,$2,$3,$4)',
        [level, title, summary, modules]
      );
    }
  }
  TABLES_READY = true;
}

router.use(async (req, res, next) => {
  try { await ensureTables(); next(); } catch (e) { next(e); }
});

// ---------------------------------------------------------------------------
// NEEDS-CREDS: Restaurant POS menu pull
// ---------------------------------------------------------------------------
router.post('/restaurant/menu/pull', auth, async (req, res) => {
  const provider = (req.body?.provider || '').toLowerCase();
  if (!provider) return res.status(400).json({ error: 'provider required (toast | square)' });
  const missing = [];
  if (provider === 'toast' && !process.env.TOAST_API_KEY) missing.push('TOAST_API_KEY');
  if (provider === 'square' && !process.env.SQUARE_API_KEY) missing.push('SQUARE_API_KEY');
  if (!['toast', 'square'].includes(provider)) {
    return res.status(400).json({ error: 'unsupported provider', supported: ['toast', 'square'] });
  }
  if (missing.length) {
    return res.status(503).json({ error: `${provider} not configured`, missing, provider });
  }
  res.status(503).json({ error: `${provider} adapter not yet implemented`, provider });
});

// ---------------------------------------------------------------------------
// MECHANICAL: Per-menu-item wine pairings (uses existing AI helper)
// ---------------------------------------------------------------------------
router.post('/restaurant/menu/pair', auth, async (req, res) => {
  const items = Array.isArray(req.body?.items) ? req.body.items : [];
  if (!items.length) return res.status(400).json({ error: 'items[] required' });
  if (aiKeyMissing()) {
    return res.status(503).json({ error: 'AI not configured: OPENROUTER_API_KEY missing', missing: ['OPENROUTER_API_KEY'] });
  }
  try {
    const prompt = `Suggest a wine pairing for each menu item. Return STRICT JSON:
{"pairings":[{"item":"...","wine":"...","style":"...","price_band_usd":"low|mid|high","reasoning":"..."}]}
Menu items: ${JSON.stringify(items)}`;
    const content = await callOpenRouter(prompt, 'You are a Master Sommelier. Return only valid JSON.');
    let parsed = null;
    try { parsed = JSON.parse(content); } catch { parsed = { raw: content }; }
    res.json(parsed);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ---------------------------------------------------------------------------
// NEEDS-CREDS: Distributor auto-reorder (Southern Glazer / RNDC stubs)
// ---------------------------------------------------------------------------
router.post('/distributors/order', auth, async (req, res) => {
  const provider = (req.body?.provider || '').toLowerCase();
  const missing = [];
  if (!['southernglazer', 'rndc', 'breakthru'].includes(provider)) {
    return res.status(400).json({ error: 'unsupported provider', supported: ['southernglazer', 'rndc', 'breakthru'] });
  }
  if (provider === 'southernglazer' && !process.env.SOUTHERNGLAZER_API_KEY) missing.push('SOUTHERNGLAZER_API_KEY');
  if (provider === 'rndc' && !process.env.RNDC_API_KEY) missing.push('RNDC_API_KEY');
  if (provider === 'breakthru' && !process.env.BREAKTHRU_API_KEY) missing.push('BREAKTHRU_API_KEY');
  if (missing.length) {
    return res.status(503).json({ error: `${provider} not configured`, missing, provider });
  }
  // Once creds exist, queue a record (still 503 because adapter not implemented).
  await pool.query(
    `INSERT INTO distributor_orders (provider, status, payload) VALUES ($1, 'queued', $2)`,
    [provider, JSON.stringify(req.body || {})]
  );
  res.status(503).json({ error: `${provider} adapter not yet implemented`, provider });
});

router.get('/distributors/orders', auth, async (req, res) => {
  const r = await pool.query(`SELECT * FROM distributor_orders ORDER BY id DESC LIMIT 100`);
  res.json({ data: r.rows });
});

// ---------------------------------------------------------------------------
// NEEDS-PRODUCT-DECISION: Sommelier certification module
// ---------------------------------------------------------------------------
router.get('/sommelier/courses', auth, async (req, res) => {
  const r = await pool.query(`SELECT * FROM sommelier_courses ORDER BY id ASC`);
  res.json({ courses: r.rows, note: 'Built-in 4-tier curriculum. Self-attested progress, no proctoring.' });
});

router.post('/sommelier/progress', auth, async (req, res) => {
  const { course_id, modules_completed, quiz_score } = req.body || {};
  if (!course_id) return res.status(400).json({ error: 'course_id required' });
  const completed = Math.max(0, parseInt(modules_completed, 10) || 0);
  const score = quiz_score != null ? Number(quiz_score) : null;
  const cr = await pool.query('SELECT modules FROM sommelier_courses WHERE id = $1', [course_id]);
  if (!cr.rows.length) return res.status(404).json({ error: 'course not found' });
  const totalModules = cr.rows[0].modules;
  const certified = completed >= totalModules && (score == null || score >= 70);
  const r = await pool.query(
    `INSERT INTO sommelier_progress (user_id, course_id, modules_completed, quiz_score, certified_at)
     VALUES ($1,$2,$3,$4, $5)
     ON CONFLICT (user_id, course_id) DO UPDATE
       SET modules_completed = EXCLUDED.modules_completed,
           quiz_score = EXCLUDED.quiz_score,
           certified_at = EXCLUDED.certified_at
     RETURNING *`,
    [req.user?.id || 0, course_id, completed, score, certified ? new Date() : null]
  );
  res.json({ progress: r.rows[0], certified });
});

router.get('/sommelier/progress', auth, async (req, res) => {
  const r = await pool.query(
    `SELECT p.*, c.level, c.title, c.modules AS total_modules
       FROM sommelier_progress p
       JOIN sommelier_courses c ON c.id = p.course_id
      WHERE p.user_id = $1
      ORDER BY p.id DESC`,
    [req.user?.id || 0]
  );
  res.json({ data: r.rows });
});

module.exports = router;
