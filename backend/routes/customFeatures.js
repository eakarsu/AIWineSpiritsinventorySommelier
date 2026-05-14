// Custom feature endpoints (batch_09 audit suggestions)
const router = require('express').Router();
const auth = require('../middleware/auth');
const https = require('https');

const MODEL = process.env.OPENROUTER_MODEL || 'anthropic/claude-haiku-4.5';

function callLLM(system, user, { maxTokens = 1800, temperature = 0.5 } = {}) {
  return new Promise((resolve, reject) => {
    if (!process.env.OPENROUTER_API_KEY) {
      const e = new Error('OPENROUTER_API_KEY not configured'); e.statusCode = 503; return reject(e);
    }
    const body = JSON.stringify({
      model: MODEL,
      messages: [{ role: 'system', content: system }, { role: 'user', content: user }],
      max_tokens: maxTokens, temperature,
    });
    const r = https.request({
      hostname: 'openrouter.ai', path: '/api/v1/chat/completions', method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'HTTP-Referer': 'http://localhost:3000',
        'X-Title': 'Wine Sommelier AI',
      },
    }, (resp) => {
      let data = '';
      resp.on('data', c => data += c);
      resp.on('end', () => {
        try {
          const j = JSON.parse(data);
          if (j.error) return reject(new Error(j.error.message));
          resolve({ content: j.choices?.[0]?.message?.content || '', model: j.model });
        } catch (e) { reject(new Error('Bad AI response')); }
      });
    });
    r.on('error', reject);
    r.write(body); r.end();
  });
}

function parseJSON(t) {
  if (!t) return null;
  const c = String(t).replace(/```(?:json)?/gi, '').replace(/```/g, '');
  const m = c.match(/\{[\s\S]*\}/) || c.match(/\[[\s\S]*\]/);
  if (!m) return null;
  try { return JSON.parse(m[0]); } catch { return null; }
}

function err(res, e, label) {
  if (e.statusCode === 503) return res.status(503).json({ error: e.message });
  console.error(`${label} error:`, e.message);
  res.status(500).json({ error: e.message });
}

// 1. Predictive purchase recommendations from tasting history + occasion
router.post('/purchase-recommend', auth, async (req, res) => {
  try {
    const { tasting_history, occasion, budget_usd } = req.body || {};
    const ai = await callLLM(
      'You recommend bottles to purchase from a customer tasting history + occasion. JSON only.',
      `HISTORY: ${JSON.stringify(tasting_history || []).slice(0,3000)}\nOCCASION: ${occasion || 'general'}\nBUDGET_USD: ${budget_usd || 100}\nReturn JSON {"recommendations":[{"name":"","style":"","price_usd":0,"why":"","confidence":0}],"top_pick":""}`
    );
    res.json({ type: 'purchase-recommend', result: parseJSON(ai.content) || { raw: ai.content }, model: ai.model });
  } catch (e) { err(res, e, 'purchase-recommend'); }
});

// 2. Sommelier certification program with AI-graded courses
router.post('/cert-grade', auth, async (req, res) => {
  try {
    const { course_level, answers } = req.body || {};
    if (!Array.isArray(answers)) return res.status(400).json({ error: 'answers array required' });
    const ai = await callLLM(
      'You grade sommelier certification short-answer exams. JSON only.',
      `LEVEL: ${course_level || 'L1'}\nANSWERS: ${JSON.stringify(answers).slice(0,4000)}\nReturn JSON {"per_question":[{"index":0,"score":0,"feedback":""}],"total_score":0,"pass":false,"areas_to_study":[""]}`
    );
    res.json({ type: 'cert-grade', result: parseJSON(ai.content) || { raw: ai.content }, model: ai.model });
  } catch (e) { err(res, e, 'cert-grade'); }
});

// 3. Real-time wine market trend detection
// TODO: configure credentials for WINE_MARKET_DATA_KEY (Liv-ex/Wine-Searcher).
router.post('/market-trends', auth, async (req, res) => {
  try {
    const { region, category, lookback_days = 30 } = req.body || {};
    const ai = await callLLM(
      `You detect wine market trends. Market data feed: ${Boolean(process.env.WINE_MARKET_DATA_KEY)}. JSON only.`,
      `REGION: ${region || 'global'}\nCATEGORY: ${category || 'red'}\nLOOKBACK_DAYS: ${lookback_days}\nReturn JSON {"trending_up":[{"name":"","change_pct":0}],"trending_down":[{"name":"","change_pct":0}],"narrative":"","next_watch":[""]}`
    );
    res.json({ type: 'market-trends', result: parseJSON(ai.content) || { raw: ai.content }, model: ai.model });
  } catch (e) { err(res, e, 'market-trends'); }
});

// 4. Restaurant menu integration: auto-suggest pairings
router.post('/menu-pairings', auth, async (req, res) => {
  try {
    const { menu_items, available_inventory } = req.body || {};
    if (!Array.isArray(menu_items)) return res.status(400).json({ error: 'menu_items array required' });
    const ai = await callLLM(
      'You map dishes to bottles from available inventory. JSON only.',
      `MENU: ${JSON.stringify(menu_items.slice(0,40))}\nINVENTORY: ${JSON.stringify((available_inventory || []).slice(0,80))}\nReturn JSON {"pairings":[{"dish":"","wine":"","sku":"","rationale":""}],"upsell_pairings":[{"dish":"","premium_wine":""}]}`
    );
    res.json({ type: 'menu-pairings', result: parseJSON(ai.content) || { raw: ai.content }, model: ai.model });
  } catch (e) { err(res, e, 'menu-pairings'); }
});

// 5. Cellar storage spatial-allocation optimization
router.post('/cellar-allocation', auth, async (req, res) => {
  try {
    const { zones, bottles } = req.body || {};
    if (!Array.isArray(zones) || !Array.isArray(bottles)) return res.status(400).json({ error: 'zones and bottles arrays required' });
    const ai = await callLLM(
      'You allocate bottles to cellar zones balancing temperature, humidity, drinking window. JSON only.',
      `ZONES: ${JSON.stringify(zones.slice(0,30))}\nBOTTLES: ${JSON.stringify(bottles.slice(0,80))}\nReturn JSON {"placements":[{"bottle_id":"","zone_id":"","reason":""}],"unplaced":[""],"recommendations":[""]}`
    );
    res.json({ type: 'cellar-allocation', result: parseJSON(ai.content) || { raw: ai.content }, model: ai.model });
  } catch (e) { err(res, e, 'cellar-allocation'); }
});

// 6. Auction price prediction for rare bottles
router.post('/auction-predict', auth, async (req, res) => {
  try {
    const { bottle, recent_auction_history } = req.body || {};
    if (!bottle) return res.status(400).json({ error: 'bottle required' });
    const ai = await callLLM(
      'You predict auction hammer price for rare wine bottles. JSON only.',
      `BOTTLE: ${JSON.stringify(bottle)}\nHISTORY: ${JSON.stringify(recent_auction_history || []).slice(0,3000)}\nReturn JSON {"predicted_hammer_usd":0,"low_estimate":0,"high_estimate":0,"confidence":0,"factors":[""]}`
    );
    res.json({ type: 'auction-predict', result: parseJSON(ai.content) || { raw: ai.content }, model: ai.model });
  } catch (e) { err(res, e, 'auction-predict'); }
});

// 7. Community tasting events with AI discussion guides
router.post('/tasting-event-guide', auth, async (req, res) => {
  try {
    const { theme, bottles, attendees_level } = req.body || {};
    if (!theme) return res.status(400).json({ error: 'theme required' });
    const ai = await callLLM(
      'You author discussion guides for tasting events. JSON only.',
      `THEME: ${theme}\nBOTTLES: ${JSON.stringify(bottles || []).slice(0,2500)}\nLEVEL: ${attendees_level || 'mixed'}\nReturn JSON {"flight_order":[""],"talking_points_per_bottle":[{"bottle":"","points":[""]}],"icebreakers":[""],"trivia":[""]}`
    );
    res.json({ type: 'tasting-event-guide', result: parseJSON(ai.content) || { raw: ai.content }, model: ai.model });
  } catch (e) { err(res, e, 'tasting-event-guide'); }
});

// 8. Distributor auto-reordering integration
// TODO: configure credentials for DISTRIBUTOR_API_KEY (SevenFifty/Provi).
router.post('/distributor-reorder', auth, async (req, res) => {
  try {
    const { low_stock_items, par_levels } = req.body || {};
    if (!Array.isArray(low_stock_items)) return res.status(400).json({ error: 'low_stock_items required' });
    const ai = await callLLM(
      `You draft distributor reorder POs from low-stock items. Distributor API: ${Boolean(process.env.DISTRIBUTOR_API_KEY)}. JSON only.`,
      `LOW_STOCK: ${JSON.stringify(low_stock_items.slice(0,40))}\nPAR: ${JSON.stringify(par_levels || {})}\nReturn JSON {"orders":[{"distributor":"","lines":[{"sku":"","qty":0}],"estimated_total_usd":0,"eta_days":0}],"split_strategy":""}`
    );
    res.json({ type: 'distributor-reorder', result: parseJSON(ai.content) || { raw: ai.content }, model: ai.model });
  } catch (e) { err(res, e, 'distributor-reorder'); }
});

module.exports = router;
