const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config({ path: '../.env' });
const authenticate = require('./middleware/auth');

const app = express();
const PORT = Number(process.env.BACKEND_PORT);
if (!Number.isInteger(PORT) || PORT < 1 || PORT > 65535) throw new Error('BACKEND_PORT must be an assigned TCP port.');
const origins = String(process.env.ALLOWED_ORIGINS || '').split(',').map((value) => value.trim()).filter(Boolean);
if (!origins.length || origins.includes('*')) throw new Error('ALLOWED_ORIGINS must be an explicit allowlist.');

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({ origin(origin, callback) {
  if (!origin || origins.includes(origin)) return callback(null, true);
  return callback(new Error('Origin is not allowed by CORS.'));
}, credentials: true }));
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
app.use('/api/auth', require('./routes/auth'));
app.use('/api', authenticate);

// Routes - Original 5
app.use('/api/inventory', require('./routes/inventory'));
app.use('/api/tasting-notes', require('./routes/tastingNotes'));
app.use('/api/food-pairings', require('./routes/foodPairings'));
app.use('/api/price-optimization', require('./routes/priceOptimization'));
app.use('/api/vintage-valuation', require('./routes/vintageValuation'));
app.use('/api/ai', require('./routes/ai'));

// Routes - New 10
app.use('/api/cellar-alerts', require('./routes/cellarAlerts'));
app.use('/api/sales', require('./routes/sales'));
app.use('/api/cocktail-recipes', require('./routes/cocktailRecipes'));
app.use('/api/suppliers', require('./routes/suppliers'));
app.use('/api/wine-events', require('./routes/wineEvents'));
app.use('/api/customers', require('./routes/customers'));
app.use('/api/wishlist', require('./routes/wishlist'));
app.use('/api/temperature-log', require('./routes/temperatureLog'));
app.use('/api/deliveries', require('./routes/deliveries'));
app.use('/api/staff', require('./routes/staff'));

// Routes - New Non-AI Features
app.use('/api/tasting-journal', require('./routes/tastingJournal'));
app.use('/api/purchase-orders', require('./routes/purchaseOrders'));
app.use('/api/expenses', require('./routes/expenses'));
app.use('/api/inventory-audits', require('./routes/inventoryAudits'));
app.use('/api/wine-labels', require('./routes/wineLabels'));

// Routes - Non-AI Features Batch 2
app.use('/api/cellar-zones', require('./routes/cellarZones'));
app.use('/api/consumption-log', require('./routes/consumptionLog'));
app.use('/api/wine-clubs', require('./routes/wineClubs'));
app.use('/api/reservations', require('./routes/reservations'));
app.use('/api/maintenance-log', require('./routes/maintenanceLog'));

// Apply pass 5 — backlog integrations (POS, distributors, sommelier cert)
app.use('/api/integrations', require('./routes/integrations'));
app.use('/api/custom', require('./routes/customFeatures'));

// // === Batch 09 Gaps & Frontend Mounts ===
app.use('/api/gap-ai-aiwinespiritsinventorysommelier', require('./routes/batch09GapAi')); // // === Batch 09 Gaps & Frontend Mounts ===
app.use('/api/gap-nonai-aiwinespiritsinventorysommelier', require('./routes/batch09GapNonai')); // // === Batch 09 Gaps & Frontend Mounts ===

// === Custom Views (mounted before listen / 404) ===
app.use('/api/custom-views', require('./routes/customViews'));

function start() {
  return app.listen(PORT, () => console.log(`Backend server running on port ${PORT}`));
}
if (require.main === module) start();
module.exports = { app, start };

