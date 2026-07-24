const router = require('express').Router();
const pool = require('../db');
const auth = require('../middleware/auth');
const https = require('https');

async function callOpenRouter(prompt, systemPrompt) {
  const apiKey = process.env.OPENROUTER_API_KEY?.trim();
  const model = process.env.OPENROUTER_MODEL?.trim();
  const baseUrl = process.env.OPENROUTER_BASE_URL?.trim().replace(/\/$/, '');
  if (!apiKey) throw new Error('OPENROUTER_API_KEY is required');
  if (!model) throw new Error('OPENROUTER_MODEL is required');
  if (baseUrl !== 'https://openrouter.ai/api/v1') {
    throw new Error('OPENROUTER_BASE_URL must be https://openrouter.ai/api/v1');
  }

  const body = JSON.stringify({
    model: model,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: prompt }
    ],
    max_tokens: 2000,
    temperature: 0.7
  });

  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'openrouter.ai',
      path: '/api/v1/chat/completions',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'http://localhost:3000',
        'X-Title': 'Wine Sommelier AI'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (res.statusCode < 200 || res.statusCode >= 300 || parsed.error) {
            reject(new Error(parsed.error.message || 'OpenRouter API error'));
          } else {
            const content = parsed.choices?.[0]?.message?.content;
            if (typeof content !== 'string' || !content.trim()) {
              reject(new Error('OpenRouter returned an empty response'));
            } else {
              resolve(content);
            }
          }
        } catch (e) {
          reject(new Error('Failed to parse AI response'));
        }
      });
    });

    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

// AI Tasting Note Generation
router.post('/tasting-note', auth, async (req, res) => {
  try {
    const { wine_name, type, category, region, country, vintage, producer } = req.body;
    const systemPrompt = `You are a world-class Master Sommelier with decades of experience. Generate professional, detailed tasting notes. Respond in this exact format with clear sections:

**APPEARANCE:** [detailed description]

**NOSE:** [detailed aroma description]

**PALATE:** [detailed taste description]

**FINISH:** [length and character]

**OVERALL SCORE:** [X.X/10]

**SUMMARY:** [2-3 sentence overall assessment]

**FOOD PAIRING SUGGESTIONS:** [3-4 dishes]

**DRINKING WINDOW:** [optimal years]`;

    const prompt = `Generate professional tasting notes for: ${wine_name}${vintage ? ` (${vintage} vintage)` : ''}, ${category || type}, from ${region || 'Unknown Region'}, ${country || 'Unknown Country'}. Producer: ${producer || 'Unknown'}. Be specific, authentic, and detailed.`;

    const aiResponse = await callOpenRouter(prompt, systemPrompt);

    // Save to database
    await pool.query(
      `INSERT INTO tasting_notes (wine_name, ai_generated, ai_tasting_note, ai_summary)
       VALUES ($1, true, $2, $3)`,
      [wine_name, aiResponse, aiResponse.substring(0, 500)]
    );

    res.json({ result: aiResponse, wine_name });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// AI Food Pairing
router.post('/food-pairing', auth, async (req, res) => {
  try {
    const { wine_name, wine_type, category, region, flavor_profile } = req.body;
    const systemPrompt = `You are a world-class Sommelier and Chef specializing in wine and food pairings. Provide expert pairing recommendations. Respond in this exact format:

**TOP PAIRINGS:**

1. **[Dish Name]** - Score: [X.X/10]
   - Why it works: [explanation]
   - Flavor bridge: [connecting flavors]

2. **[Dish Name]** - Score: [X.X/10]
   - Why it works: [explanation]
   - Flavor bridge: [connecting flavors]

3. **[Dish Name]** - Score: [X.X/10]
   - Why it works: [explanation]
   - Flavor bridge: [connecting flavors]

4. **[Dish Name]** - Score: [X.X/10]
   - Why it works: [explanation]
   - Flavor bridge: [connecting flavors]

5. **[Dish Name]** - Score: [X.X/10]
   - Why it works: [explanation]
   - Flavor bridge: [connecting flavors]

**PAIRING PRINCIPLES:** [Brief explanation of why these work]

**AVOID:** [Foods to avoid with this wine and why]

**MENU CONCEPT:** [A 3-course menu suggestion built around this wine]`;

    const prompt = `Suggest the best food pairings for: ${wine_name}, Type: ${wine_type || 'Unknown'}, Category: ${category || 'Unknown'}, Region: ${region || 'Unknown'}${flavor_profile ? `, Flavor Profile: ${flavor_profile}` : ''}. Be specific and creative.`;

    const aiResponse = await callOpenRouter(prompt, systemPrompt);

    await pool.query(
      `INSERT INTO food_pairings (wine_name, wine_type, dish_name, ai_generated, ai_suggestions, ai_menu_recommendations)
       VALUES ($1, $2, 'AI Generated Pairings', true, $3, $4)`,
      [wine_name, wine_type, aiResponse, aiResponse]
    );

    res.json({ result: aiResponse, wine_name });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// AI Price Optimization
router.post('/price-optimization', auth, async (req, res) => {
  try {
    const { wine_name, current_price, cost_price, wine_type, region, vintage, market_segment } = req.body;
    const systemPrompt = `You are a wine retail pricing expert and market analyst. Provide data-driven price optimization recommendations. Respond in this exact format:

**PRICING ANALYSIS:**

**Current Position:** [Analysis of current pricing]

**Recommended Retail Price:** $[X.XX]
**Recommended Margin:** [X.X%]

**MARKET ANALYSIS:**
- Market average: $[estimated]
- Competitive position: [above/below/at market]
- Demand assessment: [High/Medium/Low]
- Price elasticity: [assessment]

**STRATEGY RECOMMENDATION:**
[Detailed pricing strategy]

**SEASONAL CONSIDERATIONS:**
[How pricing should vary by season]

**REVENUE OPTIMIZATION:**
- Volume strategy: [recommendation]
- By-the-glass pricing: $[X.XX] (if applicable)
- Case discount: [recommendation]

**KEY INSIGHTS:**
[3-4 bullet points with actionable insights]`;

    const prompt = `Analyze pricing for: ${wine_name}. Current retail: $${current_price || 'unknown'}, Cost: $${cost_price || 'unknown'}, Type: ${wine_type || 'Unknown'}, Region: ${region || 'Unknown'}, Vintage: ${vintage || 'N/A'}, Market segment: ${market_segment || 'premium retail'}. Provide optimization recommendations.`;

    const aiResponse = await callOpenRouter(prompt, systemPrompt);

    res.json({ result: aiResponse, wine_name });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// AI Vintage Valuation
router.post('/vintage-valuation', auth, async (req, res) => {
  try {
    const { wine_name, vintage, producer, region, current_value, purchase_price } = req.body;
    const systemPrompt = `You are a wine investment specialist and auction house expert. Provide detailed vintage valuation analysis. Respond in this exact format:

**VALUATION REPORT:**

**Wine:** [Name]
**Vintage:** [Year]

**ESTIMATED CURRENT VALUE:** $[X,XXX]
**VALUE TREND:** [Appreciating/Stable/Declining]
**INVESTMENT GRADE:** [Yes/No]

**CRITICAL SCORES (Estimated):**
- Wine Spectator: [XX/100]
- Robert Parker: [XX/100]
- James Decanter: [XX/100]

**VINTAGE ASSESSMENT:**
[Detailed assessment of the vintage quality]

**MATURITY WINDOW:**
- Drinking window: [years]
- Peak: [year range]
- Current status: [Young/Developing/Optimal/Declining]

**INVESTMENT ANALYSIS:**
- 3-year projection: [estimated value]
- 5-year projection: [estimated value]
- Risk level: [Low/Medium/High]
- Rarity: [Common/Limited/Rare/Ultra Rare]

**AUCTION MARKET:**
[Recent auction trends and comparable sales]

**RECOMMENDATION:**
[Buy/Hold/Sell recommendation with reasoning]`;

    const prompt = `Provide vintage valuation analysis for: ${wine_name}${vintage ? ` ${vintage}` : ''}, Producer: ${producer || 'Unknown'}, Region: ${region || 'Unknown'}. Current value: $${current_value || 'unknown'}, Purchase price: $${purchase_price || 'unknown'}. Assess investment potential and market outlook.`;

    const aiResponse = await callOpenRouter(prompt, systemPrompt);

    res.json({ result: aiResponse, wine_name });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// AI Cocktail Recipe
router.post('/cocktail-recipe', auth, async (req, res) => {
  try {
    const { spirit_name, spirit_type, flavor_preferences, occasion, difficulty } = req.body;
    const systemPrompt = `You are a world-class mixologist. Create unique cocktail recipes. Use **bold** markdown headers for sections. Include: cocktail name, ingredients list, step-by-step instructions, garnish, glassware, flavor profile, occasion, and bartender tips.`;
    const prompt = `Create a unique cocktail recipe using ${spirit_name || 'a premium spirit'} (${spirit_type || 'any type'}). ${flavor_preferences ? `Flavor: ${flavor_preferences}.` : ''} ${occasion ? `Occasion: ${occasion}.` : ''} ${difficulty ? `Difficulty: ${difficulty}.` : ''}`;
    const aiResponse = await callOpenRouter(prompt, systemPrompt);
    res.json({ result: aiResponse });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// AI Sommelier Chat
router.post('/sommelier-chat', auth, async (req, res) => {
  try {
    const { message } = req.body;
    const systemPrompt = `You are a Master Sommelier with 30+ years of experience. Answer wine and spirits questions with expert knowledge. Be warm, professional, and educational. Use **bold** for key terms. Keep answers concise but informative.`;
    const aiResponse = await callOpenRouter(message, systemPrompt);
    res.json({ result: aiResponse });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// AI Wine Region Explorer
router.post('/region-explorer', auth, async (req, res) => {
  try {
    const { region, country, interest } = req.body;
    const systemPrompt = `You are a wine geography expert and Master Sommelier. Provide detailed wine region guides. Use **bold** headers. Include: region overview, key appellations, signature grapes, top producers, climate, soil, best vintages, food pairings, and travel tips.`;
    const prompt = `Provide a comprehensive guide to the wine region: ${region || 'unknown'}, ${country || ''}. ${interest ? `Focus on: ${interest}` : 'Cover all aspects.'}`;
    const aiResponse = await callOpenRouter(prompt, systemPrompt);
    res.json({ result: aiResponse });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// AI Cellar Analysis
router.post('/cellar-analysis', auth, async (req, res) => {
  try {
    const { inventory_summary, alert_summary } = req.body;
    const systemPrompt = `You are an expert wine cellar manager. Analyze cellar status and provide recommendations. Use **bold** headers for sections.`;
    const prompt = `Analyze this cellar: ${inventory_summary || 'Various wines'}. Alerts: ${alert_summary || 'Multiple pending'}. Provide: immediate actions, seasonal drinking suggestions, purchase recommendations, organization tips.`;
    const aiResponse = await callOpenRouter(prompt, systemPrompt);
    res.json({ result: aiResponse });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// AI Sales Analysis
router.post('/sales-analysis', auth, async (req, res) => {
  try {
    const { sales_summary, revenue, top_sellers } = req.body;
    const systemPrompt = `You are a wine retail business analyst. Analyze sales data and provide insights. Use **bold** headers.`;
    const prompt = `Analyze sales: ${sales_summary || 'Wine retail sales data'}. Revenue: ${revenue || 'N/A'}. Top sellers: ${top_sellers || 'N/A'}. Provide: performance analysis, optimization strategies, customer insights, growth opportunities.`;
    const aiResponse = await callOpenRouter(prompt, systemPrompt);
    res.json({ result: aiResponse });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// AI Wine Education
router.post('/wine-education', auth, async (req, res) => {
  try {
    const { topic } = req.body;
    const systemPrompt = `You are a Master of Wine and wine educator. Explain wine topics clearly and engagingly for both beginners and experts. Use **bold** headers. Include practical tips and interesting facts.`;
    const prompt = `Teach me about: ${topic || 'wine basics'}. Be comprehensive but accessible.`;
    const aiResponse = await callOpenRouter(prompt, systemPrompt);
    res.json({ result: aiResponse });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Helper: 503 when OpenRouter key is missing
function aiKeyMissing() {
  const k = process.env.OPENROUTER_API_KEY;
  return !k || k === 'your_openrouter_api_key_here';
}

// AI Predictive Purchase Recommendations
// Body: { occasion?, budget?, party_size?, food_pairing?, preferences?, region_focus?, vintage_focus?, exclude? }
// Pulls the user's tasting_journal + recent inventory and suggests new wines to buy.
router.post('/predictive-purchase', auth, async (req, res) => {
  try {
    if (aiKeyMissing()) {
      return res.status(503).json({ error: 'AI not configured: OPENROUTER_API_KEY is missing' });
    }
    const {
      occasion,
      budget,
      party_size,
      food_pairing,
      preferences,
      region_focus,
      vintage_focus,
      exclude
    } = req.body || {};

    // Build grounding from the user's recent tasting history & inventory
    let journal = [];
    let inventory = [];
    try {
      const j = await pool.query(
        'SELECT wine_name, occasion, personal_rating, would_buy_again, taste_notes, aroma_notes, mood, price_paid FROM tasting_journal ORDER BY tasting_date DESC NULLS LAST LIMIT 20'
      );
      journal = j.rows;
    } catch (_e) {}
    try {
      const inv = await pool.query(
        'SELECT name, type, category, region, country, vintage, producer, current_value FROM inventory ORDER BY date_added DESC NULLS LAST LIMIT 25'
      );
      inventory = inv.rows;
    } catch (_e) {}

    const journalSummary = journal.length
      ? journal.map(r => `- ${r.wine_name} (rating=${r.personal_rating || 'n/a'}, would_buy_again=${r.would_buy_again ? 'yes' : 'no'}, occasion=${r.occasion || 'n/a'}, paid=${r.price_paid || 'n/a'}, taste=${(r.taste_notes || '').slice(0, 120)})`).join('\n')
      : 'No tasting journal entries yet.';
    const inventorySummary = inventory.length
      ? inventory.map(r => `- ${r.name} | ${r.type}/${r.category} | ${r.region || '-'}, ${r.country || '-'} | vintage ${r.vintage || 'NV'} | producer ${r.producer || '-'}`).join('\n')
      : 'No inventory recorded.';

    const systemPrompt = `You are a Master Sommelier and wine retail buyer. Generate predictive purchase recommendations based on the user's tasting history and current cellar. Return ONLY valid JSON in this shape:
{
  "summary": "<2-3 sentence overall recommendation>",
  "recommendations": [
    {
      "wine_name": "<producer + cuvee>",
      "type": "red|white|rose|sparkling|dessert|fortified|spirit",
      "region": "...",
      "country": "...",
      "vintage_or_nv": "...",
      "estimated_retail_price_usd": <number>,
      "confidence": "low|medium|high",
      "rationale": "<why it fits this user's profile>",
      "pairing_idea": "...",
      "alternative_if_unavailable": "..."
    }
  ],
  "diversification_notes": "<gaps in current cellar to consider>"
}
Provide 5-7 recommendations.`;

    const prompt = `Recommend wines/spirits to purchase next.

Occasion: ${occasion || 'general restocking'}
Budget per bottle: ${budget || 'flexible'}
Party size: ${party_size || 'n/a'}
Food pairing: ${food_pairing || 'n/a'}
Stated preferences: ${preferences || 'none specified'}
Region focus: ${region_focus || 'open'}
Vintage focus: ${vintage_focus || 'open'}
Exclude: ${exclude || 'none'}

=== USER'S RECENT TASTING JOURNAL (${journal.length}) ===
${journalSummary}

=== CURRENT CELLAR (${inventory.length}) ===
${inventorySummary}`;

    const aiResponse = await callOpenRouter(prompt, systemPrompt);

    // Best-effort JSON parse
    let parsed = null;
    try {
      const cleaned = String(aiResponse || '')
        .replace(/^```(?:json)?\s*/g, '')
        .replace(/```\s*$/g, '')
        .trim();
      parsed = JSON.parse(cleaned);
    } catch (_e) {}

    res.json({
      result: aiResponse,
      parsed,
      grounding: {
        journal_count: journal.length,
        inventory_count: inventory.length
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// AI Auction Price Prediction
// Body: { wine_name, vintage?, producer?, region?, condition?, provenance?, recent_auction_prices? }
// Returns a structured estimate (low/expected/high) with reasoning. Honest about
// uncertainty when no auction data is provided.
router.post('/auction-price-predict', auth, async (req, res) => {
  try {
    if (aiKeyMissing()) {
      return res.status(503).json({ error: 'AI not configured: OPENROUTER_API_KEY is missing' });
    }
    const {
      wine_name,
      vintage,
      producer,
      region,
      condition,
      provenance,
      recent_auction_prices
    } = req.body || {};

    if (!wine_name || !String(wine_name).trim()) {
      return res.status(400).json({ error: 'wine_name is required' });
    }

    const systemPrompt = `You are a wine auction specialist. Predict a fine-wine auction hammer price for the supplied bottle. Return ONLY valid JSON:
{
  "wine": "...",
  "vintage": "...",
  "estimate": {
    "low_usd": <number>,
    "expected_usd": <number>,
    "high_usd": <number>,
    "currency": "USD"
  },
  "confidence": "low|medium|high",
  "key_factors": ["..."],
  "comparable_lots": [
    { "lot_description": "...", "hammer_price_usd": <number>, "auction_house": "...", "year": <number> }
  ],
  "risks_and_caveats": ["..."],
  "recommendation": "buy|hold|sell|undecided",
  "reasoning": "<2-4 sentences>"
}
If you do not have reliable comparables, set confidence to "low" and clearly explain limitations in risks_and_caveats.`;

    const recentPricesText = Array.isArray(recent_auction_prices) && recent_auction_prices.length > 0
      ? recent_auction_prices.map((p, i) => `  ${i + 1}. ${typeof p === 'string' ? p : JSON.stringify(p)}`).join('\n')
      : 'None provided.';

    const prompt = `Predict auction price for:
Wine: ${wine_name}
Vintage: ${vintage || 'NV'}
Producer: ${producer || 'unknown'}
Region: ${region || 'unknown'}
Condition: ${condition || 'unspecified'}
Provenance: ${provenance || 'unspecified'}

Recent auction comparables (user-supplied):
${recentPricesText}`;

    const aiResponse = await callOpenRouter(prompt, systemPrompt);

    let parsed = null;
    try {
      const cleaned = String(aiResponse || '')
        .replace(/^```(?:json)?\s*/g, '')
        .replace(/```\s*$/g, '')
        .trim();
      parsed = JSON.parse(cleaned);
    } catch (_e) {}

    res.json({
      result: aiResponse,
      parsed,
      input: { wine_name, vintage: vintage || null, producer: producer || null, region: region || null }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
