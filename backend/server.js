const express = require('express');
const cors = require('cors');
require('dotenv').config({ path: '../.env' });

const app = express();
const PORT = process.env.BACKEND_PORT || 3001;

app.use(cors());
app.use(express.json());

// Routes - Original 5
app.use('/api/auth', require('./routes/auth'));
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

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// // === Batch 09 Gaps & Frontend Mounts ===
app.use('/api/gap-ai-aiwinespiritsinventorysommelier', require('./routes/batch09GapAi')); // // === Batch 09 Gaps & Frontend Mounts ===
app.use('/api/gap-nonai-aiwinespiritsinventorysommelier', require('./routes/batch09GapNonai')); // // === Batch 09 Gaps & Frontend Mounts ===

// === Custom Views (mounted before listen / 404) ===
app.use('/api/custom-views', require('./routes/customViews'));

app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});


