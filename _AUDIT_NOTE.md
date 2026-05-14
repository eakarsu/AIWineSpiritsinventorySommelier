# Audit Recommendations & Status — AIWineSpiritsinventorySommelier

Source: /Users/erolakarsu/projects/_AUDIT/reports/batch_09.md

Verdict per audit: partial-build, 10 AI endpoints, 27 non-AI routes. "Strong specialty-retail platform with sommelier AI and pricing optimization."

## Original audit recommendations

Missing AI counterparts: not explicitly listed in audit (coverage is broad).

Missing non-AI:
- Wine import/customs documentation
- Sommelier certification tracking
- Education certification
- Inventory reconciliation audits

Custom feature ideas:
- Predictive purchase recommendations (tasting history + occasion)
- Sommelier certification program
- Real-time wine market trend detection
- Restaurant menu integration / pairings
- Climate-controlled storage optimization
- Auction price prediction
- Community tasting events
- Auto-reordering with retailers/distributors

## Implemented in this pass

None. AI surface already broad. Remaining items are NEEDS-PRODUCT-DECISION (sommelier certification program is a substantial feature), NEEDS-CREDS (auction-price feeds, distributor integrations), or substantive features (storage optimization, certification tracking).

## Backlog (priority order)

1. Predictive purchase recommendation endpoint — text-only AI add-on.
2. Auction price prediction endpoint — needs auction data; without it, an AI estimate is feasible but low-fidelity.
3. Restaurant menu pairing integration — credentials decision.
4. Distributor auto-reordering — credentials decision.
5. Sommelier certification module — substantial product feature.

## Apply pass 3 (frontend)

- **Status:** FE already wired — no changes.
- **Stack:** CRA (Create-React-App) React.
- **Verification:** All 10 AI endpoints have dedicated pages — `TastingNotes.js` (`/ai/tasting-note`), `FoodPairings.js` (`/ai/food-pairing`), `PriceOptimization.js` (`/ai/price-optimization`), `VintageValuation.js` (`/ai/vintage-valuation`), `CocktailRecipes.js` (`/ai/cocktail-recipe`), `SommelierChat.js` (`/ai/sommelier-chat`), `RegionExplorer.js` (`/ai/region-explorer`), `CellarAlerts.js` (`/ai/cellar-analysis`), `Sales.js` (`/ai/sales-analysis`), `WineEducation.js` (`/ai/wine-education`). `api.js` axios client attaches JWT bearer via `localStorage.getItem('token')`.
- **No FE changes made** (idempotence rule).

## Apply pass 4 (mechanical backlog)

Implemented backlog items 1 (predictive purchase) and 2 (auction price) — both MECHANICAL text-only AI add-ons. Items 3-5 remain deferred (NEEDS-CREDS / NEEDS-PRODUCT-DECISION / substantive feature).

**Backend** (`backend/routes/ai.js`):
- Added local `aiKeyMissing()` helper. New endpoints return 503 when `OPENROUTER_API_KEY` is unset (existing helpers / endpoints unchanged to avoid touching working code).
- `POST /api/ai/predictive-purchase` — accepts `{ occasion?, budget?, party_size?, food_pairing?, preferences?, region_focus?, vintage_focus?, exclude? }`. Pulls last 20 `tasting_journal` rows + last 25 `inventory` rows for grounding, then prompts an LLM for 5-7 wine purchase recommendations as structured JSON (`recommendations[].{wine_name,type,region,country,vintage_or_nv,estimated_retail_price_usd,confidence,rationale,pairing_idea}` plus `diversification_notes`).
- `POST /api/ai/auction-price-predict` — accepts `{ wine_name (required), vintage?, producer?, region?, condition?, provenance?, recent_auction_prices? }`. Returns `{ estimate.{low_usd,expected_usd,high_usd}, confidence, key_factors[], comparable_lots[], risks_and_caveats[], recommendation, reasoning }`. Honest about uncertainty ("low" confidence) when no comparables provided.
- Both reuse existing `callOpenRouter`, `auth` middleware, and `pool` (pg). No new deps.

**Frontend** (CRA + axios):
- `frontend/src/pages/PredictivePurchase.js` — multi-field form, structured recommendation cards, JWT bearer via existing axios interceptor in `api.js`. Explicit 503 toast.
- `frontend/src/pages/AuctionPricePredictor.js` — form for wine + comparables, structured estimate panel (low/expected/high, confidence, key factors, comparable lots, risks). Explicit 503 toast.
- `frontend/src/App.js` — registered `/predictive-purchase` and `/auction-price-predictor` inside the `Layout` `PrivateRoute`.
- `frontend/src/components/Layout.js` — added "Purchase Predictor" and "Auction Price" entries under the AI Features sidebar section.

**Smoke test (with `OPENROUTER_API_KEY=""`):**
- pkill → start backend on 3501 → `GET /api/health` → `{"status":"ok"}`.
- `POST /api/auth/login admin@winesommelier.com / admin123` → token returned.
- `POST /api/ai/predictive-purchase` (Bearer) → HTTP 503 with `{ error: "AI not configured: OPENROUTER_API_KEY is missing" }`.
- `POST /api/ai/auction-price-predict` (Bearer) → HTTP 503, same body.
- Cleanup → port clear.
