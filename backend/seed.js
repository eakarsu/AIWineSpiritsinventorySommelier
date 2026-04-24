const pool = require('./db');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

async function seed() {
  const client = await pool.connect();
  try {
    // Run schema
    const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
    await client.query(schema);
    console.log('Schema created successfully');

    // Seed user
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await client.query(`
      INSERT INTO users (email, password, name, role)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (email) DO NOTHING
    `, ['admin@winesommelier.com', hashedPassword, 'Admin User', 'admin']);
    console.log('User seeded');

    // Seed Inventory (18 items)
    const inventoryItems = [
      ['Château Margaux 2015', 'Red', 'Bordeaux', 'Margaux, Bordeaux', 'France', 2015, 'Château Margaux', 13.5, 6, '750ml', 450.00, 890.00, 'Cellar A', 'A1-01', 2025, 2045, 'First Growth Bordeaux, exceptional vintage'],
      ['Opus One 2018', 'Red', 'Napa Valley Blend', 'Napa Valley', 'USA', 2018, 'Opus One Winery', 14.5, 12, '750ml', 380.00, 420.00, 'Cellar A', 'A1-02', 2023, 2038, 'Bordeaux-style blend from Napa'],
      ['Dom Pérignon 2012', 'Sparkling', 'Champagne', 'Champagne', 'France', 2012, 'Moët & Chandon', 12.5, 8, '750ml', 220.00, 310.00, 'Cellar B', 'B1-01', 2022, 2035, 'Prestige cuvée Champagne'],
      ['Penfolds Grange 2017', 'Red', 'Shiraz', 'South Australia', 'Australia', 2017, 'Penfolds', 14.5, 4, '750ml', 550.00, 680.00, 'Cellar A', 'A2-01', 2025, 2050, 'Iconic Australian Shiraz'],
      ['Sassicaia 2019', 'Red', 'Super Tuscan', 'Bolgheri', 'Italy', 2019, 'Tenuta San Guido', 14.0, 10, '750ml', 280.00, 320.00, 'Cellar B', 'B2-01', 2024, 2040, 'Premier Super Tuscan'],
      ['Cloudy Bay Sauvignon Blanc 2023', 'White', 'Sauvignon Blanc', 'Marlborough', 'New Zealand', 2023, 'Cloudy Bay', 13.0, 24, '750ml', 22.00, 28.00, 'Cellar C', 'C1-01', 2024, 2026, 'Crisp NZ Sauvignon Blanc'],
      ['Hennessy XO Cognac', 'Spirit', 'Cognac', 'Cognac', 'France', null, 'Hennessy', 40.0, 6, '700ml', 180.00, 220.00, 'Spirit Cabinet', 'S1-01', null, null, 'Premium XO Cognac blend'],
      ['Macallan 18 Year', 'Spirit', 'Single Malt Scotch', 'Speyside', 'Scotland', null, 'The Macallan', 43.0, 3, '700ml', 320.00, 410.00, 'Spirit Cabinet', 'S1-02', null, null, 'Sherry oak matured 18 years'],
      ['Barolo Monfortino 2016', 'Red', 'Nebbiolo', 'Barolo, Piedmont', 'Italy', 2016, 'Giacomo Conterno', 14.0, 3, '750ml', 580.00, 750.00, 'Cellar A', 'A3-01', 2028, 2055, 'Legendary Barolo Riserva'],
      ['Puligny-Montrachet 2020', 'White', 'Chardonnay', 'Burgundy', 'France', 2020, 'Domaine Leflaive', 13.0, 6, '750ml', 180.00, 220.00, 'Cellar C', 'C2-01', 2023, 2032, 'Premier Burgundy white'],
      ['Vega Sicilia Único 2012', 'Red', 'Tempranillo Blend', 'Ribera del Duero', 'Spain', 2012, 'Vega Sicilia', 14.0, 4, '750ml', 420.00, 580.00, 'Cellar A', 'A3-02', 2025, 2050, 'Spain premier wine estate'],
      ['Clase Azul Reposado Tequila', 'Spirit', 'Tequila', 'Jalisco', 'Mexico', null, 'Clase Azul', 40.0, 5, '750ml', 170.00, 200.00, 'Spirit Cabinet', 'S2-01', null, null, 'Ultra-premium reposado tequila'],
      ['Tignanello 2020', 'Red', 'Super Tuscan', 'Tuscany', 'Italy', 2020, 'Antinori', 14.0, 8, '750ml', 95.00, 120.00, 'Cellar B', 'B3-01', 2024, 2035, 'Pioneering Super Tuscan blend'],
      ['Krug Grande Cuvée', 'Sparkling', 'Champagne', 'Champagne', 'France', null, 'Krug', 12.0, 4, '750ml', 250.00, 290.00, 'Cellar B', 'B1-02', 2023, 2035, 'Multi-vintage prestige Champagne'],
      ['Caymus Special Selection 2019', 'Red', 'Cabernet Sauvignon', 'Napa Valley', 'USA', 2019, 'Caymus Vineyards', 15.0, 6, '750ml', 180.00, 210.00, 'Cellar A', 'A4-01', 2024, 2039, 'Rich Napa Cab, concentrated style'],
      ['Whispering Angel Rosé 2023', 'Rosé', 'Provence Rosé', 'Provence', 'France', 2023, 'Château d\'Esclans', 13.0, 36, '750ml', 18.00, 24.00, 'Cellar C', 'C3-01', 2024, 2025, 'Iconic Provence rosé'],
      ['Yamazaki 12 Year', 'Spirit', 'Japanese Whisky', 'Osaka', 'Japan', null, 'Suntory', 43.0, 2, '700ml', 150.00, 280.00, 'Spirit Cabinet', 'S2-02', null, null, 'Award-winning Japanese whisky'],
      ['Château d\'Yquem 2017', 'White', 'Sauternes', 'Sauternes, Bordeaux', 'France', 2017, 'Château d\'Yquem', 14.0, 3, '375ml', 320.00, 420.00, 'Cellar C', 'C4-01', 2025, 2060, 'Premier Cru Supérieur Sauternes']
    ];

    for (const item of inventoryItems) {
      await client.query(`
        INSERT INTO inventory (name, type, category, region, country, vintage, producer, alcohol_pct, quantity, bottle_size, purchase_price, current_value, location, rack_position, drink_window_start, drink_window_end, notes)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)
        ON CONFLICT DO NOTHING
      `, item);
    }
    console.log('Inventory seeded: 18 items');

    // Seed Tasting Notes (16 items)
    const tastingNotes = [
      [1, 'Château Margaux 2015', 'James Sullivan', '2024-06-15', 'Deep ruby with purple rim', 'Blackcurrant, violets, cedar, graphite, subtle tobacco', 'Silky tannins, layered dark fruit, mineral core, elegant structure', 'Exceptionally long, fine-grained tannins, persistent cassis and spice', 9.6, false, null, null, null, 'Stunning vintage, needs more time'],
      [2, 'Opus One 2018', 'Maria Chen', '2024-07-20', 'Dense ruby-purple', 'Dark cherry, blackberry, mocha, vanilla, dried herbs', 'Full-bodied, plush tannins, dark chocolate, espresso bean finish', 'Long and velvety with lingering dark fruit', 9.2, false, null, null, null, 'Classic Opus One character'],
      [3, 'Dom Pérignon 2012', 'James Sullivan', '2024-08-01', 'Pale gold with fine persistent bubbles', 'Brioche, white flowers, citrus, almond, chalky minerality', 'Creamy mousse, balanced acidity, stone fruit, honeyed notes', 'Elegant and persistent with saline finish', 9.4, false, null, null, null, 'Drinking beautifully now'],
      [4, 'Penfolds Grange 2017', 'Robert Kim', '2024-05-10', 'Inky dark purple, opaque', 'Blackberry compote, dark chocolate, licorice, smoked meat, earth', 'Massive and concentrated, powerful tannins, layers of dark fruit', 'Incredibly long, tar, spice, and sweet fruit', 9.5, false, null, null, null, 'Monumental wine, cellar worthy'],
      [5, 'Sassicaia 2019', 'Maria Chen', '2024-09-05', 'Deep ruby with garnet edge', 'Cassis, Mediterranean herbs, graphite, subtle oak', 'Medium-full body, fine tannins, bright acidity, savory undertones', 'Long with herbal and mineral notes', 9.3, false, null, null, null, 'Elegant and age-worthy'],
      [6, 'Cloudy Bay Sauvignon Blanc 2023', 'Sophie Laurent', '2024-03-15', 'Pale straw with green tints', 'Gooseberry, passionfruit, cut grass, lime zest', 'Crisp acidity, tropical fruit, clean and refreshing', 'Medium length, citrus finish', 8.5, false, null, null, null, 'Perfect summer wine'],
      [9, 'Barolo Monfortino 2016', 'James Sullivan', '2024-10-20', 'Pale garnet with orange rim', 'Roses, tar, truffle, dried cherry, balsamic', 'Powerful tannins, extraordinary complexity, ethereal balance', 'Seemingly endless, tar and rose petals', 9.8, false, null, null, null, 'Transcendent wine experience'],
      [10, 'Puligny-Montrachet 2020', 'Sophie Laurent', '2024-04-12', 'Light gold with silver highlights', 'White peach, hazelnut, mineral, citrus blossom', 'Precise acidity, creamy texture, stony minerality', 'Long and focused with nutty finish', 9.1, false, null, null, null, 'Benchmark white Burgundy'],
      [11, 'Vega Sicilia Único 2012', 'Robert Kim', '2024-11-01', 'Deep ruby with tawny edge', 'Dark plum, cedar, leather, spice box, cocoa', 'Complex structure, velvety tannins, layered fruit and earth', 'Exceptionally long with sweet spice finish', 9.5, false, null, null, null, 'Peak Spanish winemaking'],
      [13, 'Tignanello 2020', 'Maria Chen', '2024-06-28', 'Ruby red with purple hints', 'Cherry, plum, vanilla, cinnamon, floral notes', 'Medium-full body, smooth tannins, vibrant fruit', 'Medium-long with spicy finish', 8.9, false, null, null, null, 'Great value Super Tuscan'],
      [14, 'Krug Grande Cuvée', 'James Sullivan', '2024-08-20', 'Golden amber with fine bubbles', 'Toasted brioche, dried apricot, honey, marzipan, hazelnut', 'Rich and complex, creamy mousse, intense flavor layers', 'Extraordinarily long and complex', 9.6, false, null, null, null, 'The pinnacle of Champagne'],
      [15, 'Caymus Special Selection 2019', 'Robert Kim', '2024-07-10', 'Deep inky purple', 'Blackberry jam, dark chocolate, vanilla, cedar', 'Full-bodied, opulent fruit, sweet tannins, rich texture', 'Long with chocolate and berry finish', 9.0, false, null, null, null, 'Quintessential Napa Cab'],
      [16, 'Whispering Angel Rosé 2023', 'Sophie Laurent', '2024-04-01', 'Pale salmon pink', 'Strawberry, white peach, citrus, floral', 'Light and refreshing, crisp acidity, delicate fruit', 'Short to medium, clean finish', 8.2, false, null, null, null, 'Crowd-pleasing rosé'],
      [18, 'Château d\'Yquem 2017', 'James Sullivan', '2024-09-15', 'Deep golden amber', 'Apricot, honey, saffron, vanilla, candied orange peel', 'Luscious sweetness balanced by vibrant acidity, complex layers', 'Endless finish with botrytis complexity', 9.7, false, null, null, null, 'Liquid gold, immortal wine'],
      [4, 'Penfolds Grange 2017 (2nd Tasting)', 'James Sullivan', '2024-11-10', 'Inky purple-black', 'Evolved nose: leather, dark spice, blackberry, cedar', 'More integrated than initial tasting, tannins softening', 'Still enormously long, gaining complexity', 9.6, false, null, null, null, 'Evolving beautifully'],
      [1, 'Château Margaux 2015 (2nd Tasting)', 'Maria Chen', '2024-12-01', 'Deep ruby, slight garnet edge', 'Opening up: violet, graphite, tobacco leaf, dark plum', 'More accessible now, silky mid-palate, seamless', 'Incredibly persistent and refined', 9.7, false, null, null, null, 'Developing magnificently']
    ];

    for (const note of tastingNotes) {
      await client.query(`
        INSERT INTO tasting_notes (inventory_id, wine_name, taster_name, date_tasted, appearance, nose, palate, finish, overall_rating, ai_generated, ai_tasting_note, ai_score, ai_summary, notes)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
      `, note);
    }
    console.log('Tasting notes seeded: 16 items');

    // Seed Food Pairings (16 items)
    const foodPairings = [
      [1, 'Château Margaux 2015', 'Red', 'Rack of Lamb with Herb Crust', 'French', 9.5, 'The elegant tannins complement the tender lamb while herbs mirror the wine herbal complexity', 'Herbes de Provence, black pepper, roasted meat fats', false, null, null, 'Classic Bordeaux pairing'],
      [2, 'Opus One 2018', 'Red', 'Prime Ribeye Steak', 'American', 9.3, 'Bold fruit and structure match the richness and fat of the ribeye', 'Charred proteins, fat richness, dark fruit intensity', false, null, null, 'Napa meets prime beef'],
      [3, 'Dom Pérignon 2012', 'Sparkling', 'Lobster Thermidor', 'French', 9.4, 'Creamy richness of the dish balanced by the champagnes acidity and complexity', 'Butter, cream, shellfish sweetness, toasty brioche', false, null, null, 'Luxury pairing'],
      [4, 'Penfolds Grange 2017', 'Red', 'Slow-Smoked BBQ Brisket', 'American BBQ', 9.2, 'Smoky powerful wine meets smoky powerful meat', 'Smoke, caramelized meat, dark spice, char', false, null, null, 'Bold with bold'],
      [5, 'Sassicaia 2019', 'Red', 'Wild Boar Pappardelle', 'Italian', 9.6, 'Tuscan wine with Tuscan game - regional harmony at its finest', 'Game, tomato, herbs, earthy richness', false, null, null, 'Terroir-driven pairing'],
      [6, 'Cloudy Bay Sauvignon Blanc 2023', 'White', 'Pan-Seared Sea Bass with Citrus', 'Mediterranean', 9.0, 'Crisp acidity and citrus notes complement the delicate fish', 'Citrus, herbs, light ocean minerality', false, null, null, 'Light and fresh match'],
      [10, 'Puligny-Montrachet 2020', 'White', 'Butter-Poached Halibut', 'French', 9.3, 'The creamy texture and hazelnut notes mirror the butter preparation', 'Butter, white fish, nutty richness', false, null, null, 'Burgundy meets the sea'],
      [11, 'Vega Sicilia Único 2012', 'Red', 'Roasted Suckling Pig', 'Spanish', 9.5, 'Traditional Spanish pairing - crispy skin fat cuts through tannins', 'Pork fat, crispy skin, herbs, sweet meat', false, null, null, 'Spanish classic combination'],
      [13, 'Tignanello 2020', 'Red', 'Osso Buco alla Milanese', 'Italian', 9.1, 'The wines cherry and spice notes elevate the braised veal', 'Braised meat, saffron risotto, gremolata herbs', false, null, null, 'Tuscany meets Milan'],
      [14, 'Krug Grande Cuvée', 'Sparkling', 'Sushi Omakase Selection', 'Japanese', 9.2, 'Complex champagne bridges the umami and delicacy of premium sushi', 'Umami, rice, fresh fish, wasabi heat', false, null, null, 'East meets West luxury'],
      [15, 'Caymus Special Selection 2019', 'Red', 'Grilled Lamb Chops with Mint', 'Mediterranean', 9.0, 'Rich fruit and sweet tannins match the char and herb of lamb', 'Grilled meat, mint, olive oil, garlic', false, null, null, 'Robust pairing'],
      [16, 'Whispering Angel Rosé 2023', 'Rosé', 'Niçoise Salad', 'French', 8.8, 'Light rosé perfectly complements this Provençal classic', 'Tuna, olives, anchovies, fresh vegetables', false, null, null, 'Provence on a plate and in a glass'],
      [18, 'Château d\'Yquem 2017', 'White', 'Foie Gras with Sauternes Reduction', 'French', 9.8, 'The ultimate classic pairing - sweet wine cuts through rich foie gras', 'Rich liver, sweet reduction, toast, fruit', false, null, null, 'The undisputed perfect pairing'],
      [9, 'Barolo Monfortino 2016', 'Red', 'White Truffle Risotto', 'Italian', 9.7, 'Barolo and truffle from the same Piedmontese terroir - magical synergy', 'Truffle aroma, creamy rice, parmesan umami', false, null, null, 'Piedmont perfection'],
      [3, 'Dom Pérignon 2012', 'Sparkling', 'Oysters Rockefeller', 'French-American', 9.1, 'Briny oysters with creamy topping matched by champagne minerality', 'Brine, spinach, cream, anise', false, null, null, 'Elegant appetizer pairing'],
      [6, 'Cloudy Bay Sauvignon Blanc 2023', 'White', 'Fresh Goat Cheese Salad', 'French', 8.9, 'Tangy goat cheese and herbaceous wine share acidic brightness', 'Tangy cheese, fresh herbs, citrus dressing', false, null, null, 'Classic SB pairing']
    ];

    for (const pairing of foodPairings) {
      await client.query(`
        INSERT INTO food_pairings (inventory_id, wine_name, wine_type, dish_name, cuisine_type, pairing_score, pairing_reason, flavor_bridge, ai_generated, ai_suggestions, ai_menu_recommendations, notes)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
      `, pairing);
    }
    console.log('Food pairings seeded: 16 items');

    // Seed Price Optimization (16 items)
    const priceOptimizations = [
      [1, 'Château Margaux 2015', 890.00, 450.00, 950.00, 52.63, 920.00, 'High', 1.15, 880.00, 0.75, false, null, null, 'Premium', 'First Growth demand steady'],
      [2, 'Opus One 2018', 420.00, 380.00, 450.00, 15.56, 435.00, 'High', 1.10, 425.00, 0.85, false, null, null, 'Market Match', 'Strong brand recognition'],
      [3, 'Dom Pérignon 2012', 310.00, 220.00, 340.00, 35.29, 325.00, 'High', 1.20, 305.00, 0.80, false, null, null, 'Premium', 'Holiday season premium'],
      [4, 'Penfolds Grange 2017', 680.00, 550.00, 720.00, 23.61, 700.00, 'Medium-High', 1.05, 675.00, 0.70, false, null, null, 'Appreciation', 'Cult wine demand growing'],
      [5, 'Sassicaia 2019', 320.00, 280.00, 350.00, 20.00, 335.00, 'Medium-High', 1.08, 315.00, 0.82, false, null, null, 'Growth', 'Super Tuscan trend rising'],
      [6, 'Cloudy Bay Sauvignon Blanc 2023', 28.00, 22.00, 32.00, 31.25, 30.00, 'Very High', 1.25, 27.00, 1.20, false, null, null, 'Volume', 'High turnover wine'],
      [7, 'Hennessy XO Cognac', 220.00, 180.00, 245.00, 26.53, 230.00, 'High', 1.10, 215.00, 0.90, false, null, null, 'Premium', 'Strong gift market'],
      [8, 'Macallan 18 Year', 410.00, 320.00, 440.00, 27.27, 425.00, 'Very High', 1.15, 400.00, 0.65, false, null, null, 'Scarcity', 'Limited allocation product'],
      [9, 'Barolo Monfortino 2016', 750.00, 580.00, 820.00, 29.27, 790.00, 'Medium', 1.05, 740.00, 0.60, false, null, null, 'Collector', 'Rare and allocated'],
      [10, 'Puligny-Montrachet 2020', 220.00, 180.00, 240.00, 25.00, 230.00, 'Medium-High', 1.08, 215.00, 0.78, false, null, null, 'Steady', 'Consistent demand from restaurants'],
      [11, 'Vega Sicilia Único 2012', 580.00, 420.00, 620.00, 32.26, 600.00, 'Medium', 1.00, 570.00, 0.65, false, null, null, 'Appreciation', 'Gaining international recognition'],
      [12, 'Clase Azul Reposado Tequila', 200.00, 170.00, 220.00, 22.73, 210.00, 'High', 1.20, 195.00, 0.95, false, null, null, 'Trending', 'Premium tequila boom'],
      [13, 'Tignanello 2020', 120.00, 95.00, 135.00, 29.63, 128.00, 'High', 1.10, 118.00, 0.90, false, null, null, 'Value Premium', 'Gateway Super Tuscan'],
      [14, 'Krug Grande Cuvée', 290.00, 250.00, 320.00, 21.88, 305.00, 'Medium-High', 1.15, 285.00, 0.72, false, null, null, 'Premium', 'Prestige champagne market'],
      [15, 'Caymus Special Selection 2019', 210.00, 180.00, 230.00, 21.74, 220.00, 'High', 1.05, 205.00, 0.88, false, null, null, 'Established', 'Strong Napa brand equity'],
      [17, 'Yamazaki 12 Year', 280.00, 150.00, 310.00, 54.84, 295.00, 'Very High', 1.30, 270.00, 0.50, false, null, null, 'Scarcity Premium', 'Supply shortage driving prices']
    ];

    for (const price of priceOptimizations) {
      await client.query(`
        INSERT INTO price_optimization (inventory_id, wine_name, current_retail_price, cost_price, suggested_price, margin_pct, market_avg_price, demand_level, seasonality_factor, competitor_price, price_elasticity, ai_generated, ai_price_analysis, ai_recommendation, strategy, notes)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)
      `, price);
    }
    console.log('Price optimization seeded: 16 items');

    // Seed Vintage Valuation (16 items)
    const vintageValuations = [
      [1, 'Château Margaux 2015', 2015, 'Château Margaux', 'Margaux, Bordeaux', 'Margaux AOC', 890.00, 450.00, 'Appreciating', 98, 99, 97, 'Rare', true, 'Peak', '2020: $680, 2022: $780, 2024: $890', false, null, null, 'Exceptional vintage for Margaux'],
      [2, 'Opus One 2018', 2018, 'Opus One Winery', 'Napa Valley', 'Napa Valley AVA', 420.00, 380.00, 'Stable', 96, 97, 95, 'Moderate', false, 'Young', '2021: $395, 2023: $410, 2024: $420', false, null, null, 'Steady appreciation expected'],
      [3, 'Dom Pérignon 2012', 2012, 'Moët & Chandon', 'Champagne', 'Champagne AOC', 310.00, 220.00, 'Appreciating', 96, 98, 96, 'Limited', true, 'Optimal', '2018: $210, 2021: $260, 2024: $310', false, null, null, 'Exceptional champagne vintage'],
      [4, 'Penfolds Grange 2017', 2017, 'Penfolds', 'South Australia', 'Multi-Regional', 680.00, 550.00, 'Strong Appreciation', 97, 98, 97, 'Rare', true, 'Developing', '2021: $580, 2023: $640, 2024: $680', false, null, null, 'Top-tier Grange vintage'],
      [5, 'Sassicaia 2019', 2019, 'Tenuta San Guido', 'Bolgheri', 'Bolgheri DOC', 320.00, 280.00, 'Appreciating', 96, 97, 96, 'Moderate', false, 'Young', '2022: $290, 2023: $305, 2024: $320', false, null, null, 'Strong Super Tuscan vintage'],
      [9, 'Barolo Monfortino 2016', 2016, 'Giacomo Conterno', 'Barolo, Piedmont', 'Barolo DOCG', 750.00, 580.00, 'Strong Appreciation', 99, 98, 100, 'Very Rare', true, 'Developing', '2022: $620, 2023: $680, 2024: $750', false, null, null, 'Legendary vintage and producer'],
      [10, 'Puligny-Montrachet 2020', 2020, 'Domaine Leflaive', 'Burgundy', 'Puligny-Montrachet AOC', 220.00, 180.00, 'Stable', 94, 93, 94, 'Limited', false, 'Young', '2022: $195, 2023: $210, 2024: $220', false, null, null, 'Solid white Burgundy vintage'],
      [11, 'Vega Sicilia Único 2012', 2012, 'Vega Sicilia', 'Ribera del Duero', 'Ribera del Duero DO', 580.00, 420.00, 'Appreciating', 97, 96, 98, 'Rare', true, 'Optimal', '2020: $480, 2022: $530, 2024: $580', false, null, null, 'Late-released greatness'],
      [13, 'Tignanello 2020', 2020, 'Antinori', 'Tuscany', 'Toscana IGT', 120.00, 95.00, 'Stable', 94, 95, 93, 'Moderate', false, 'Young', '2023: $110, 2024: $120', false, null, null, 'Accessible and well-priced'],
      [14, 'Krug Grande Cuvée', null, 'Krug', 'Champagne', 'Champagne AOC', 290.00, 250.00, 'Stable', 96, 97, 96, 'Limited', false, 'Optimal', '2022: $270, 2023: $280, 2024: $290', false, null, null, 'Multi-vintage but limited production'],
      [15, 'Caymus Special Selection 2019', 2019, 'Caymus Vineyards', 'Napa Valley', 'Napa Valley AVA', 210.00, 180.00, 'Stable', 94, 93, 93, 'Moderate', false, 'Young', '2022: $195, 2023: $200, 2024: $210', false, null, null, 'Popular Napa collectible'],
      [18, 'Château d\'Yquem 2017', 2017, 'Château d\'Yquem', 'Sauternes, Bordeaux', 'Sauternes AOC', 420.00, 320.00, 'Appreciating', 97, 98, 97, 'Rare', true, 'Developing', '2021: $350, 2023: $390, 2024: $420', false, null, null, 'Immortal sweet wine'],
      [null, 'Screaming Eagle 2019', 2019, 'Screaming Eagle', 'Napa Valley', 'Oakville AVA', 3800.00, 2500.00, 'Strong Appreciation', 99, 100, 98, 'Ultra Rare', true, 'Young', '2022: $3200, 2023: $3500, 2024: $3800', false, null, null, 'Trophy wine investment'],
      [null, 'Romanée-Conti 2018', 2018, 'Domaine de la Romanée-Conti', 'Burgundy', 'Romanée-Conti Grand Cru', 22000.00, 15000.00, 'Strong Appreciation', 99, 100, 99, 'Ultra Rare', true, 'Developing', '2022: $18000, 2023: $20000, 2024: $22000', false, null, null, 'The most coveted wine in the world'],
      [null, 'Petrus 2016', 2016, 'Petrus', 'Pomerol, Bordeaux', 'Pomerol AOC', 4200.00, 3000.00, 'Strong Appreciation', 100, 100, 99, 'Ultra Rare', true, 'Developing', '2021: $3400, 2023: $3800, 2024: $4200', false, null, null, 'Perfect vintage for Petrus'],
      [null, 'Salon Le Mesnil 2012', 2012, 'Salon', 'Champagne', 'Champagne AOC', 650.00, 420.00, 'Appreciating', 98, 97, 98, 'Very Rare', true, 'Optimal', '2020: $480, 2022: $560, 2024: $650', false, null, null, 'Single-vintage, single-vineyard Champagne']
    ];

    for (const val of vintageValuations) {
      await client.query(`
        INSERT INTO vintage_valuation (inventory_id, wine_name, vintage, producer, region, appellation, current_market_value, purchase_price, value_trend, critic_score_ws, critic_score_rp, critic_score_jd, rarity_level, investment_grade, maturity_status, auction_history, ai_generated, ai_valuation_analysis, ai_investment_recommendation, notes)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20)
      `, val);
    }
    console.log('Vintage valuation seeded: 16 items');

    // Seed Cellar Alerts (16 items)
    const cellarAlerts = [
      [1, 'Château Margaux 2015', 'Drink Window Opening', 'medium', 'Château Margaux 2015 is entering its optimal drinking window', 'Drink window: 2025-2045. Now entering prime drinking period.', false, false],
      [6, 'Cloudy Bay Sauvignon Blanc 2023', 'Drink Window Closing', 'high', 'Cloudy Bay SB 2023 should be consumed soon', 'Drink window ends 2026. Best consumed within 6 months.', false, false],
      [16, 'Whispering Angel Rosé 2023', 'Drink Window Closing', 'high', 'Whispering Angel 2023 past optimal drinking', 'Drink window ended 2025. Consume immediately.', false, false],
      [17, 'Yamazaki 12 Year', 'Low Stock', 'high', 'Yamazaki 12 Year stock critically low', 'Only 2 bottles remaining. Allocation product - reorder immediately.', false, false],
      [9, 'Barolo Monfortino 2016', 'Value Increase', 'low', 'Barolo Monfortino 2016 value increased 10%', 'Current value $750, up from $680 last quarter.', true, false],
      [4, 'Penfolds Grange 2017', 'Value Increase', 'low', 'Penfolds Grange 2017 appreciation noted', 'Value up 6.25% this quarter. Strong collector demand.', true, false],
      [8, 'Macallan 18 Year', 'Low Stock', 'high', 'Macallan 18 Year stock low', 'Only 3 bottles remaining. Limited allocation expected.', false, false],
      [3, 'Dom Pérignon 2012', 'Optimal Drinking', 'medium', 'Dom Pérignon 2012 at peak drinking', 'Currently in optimal drinking window 2022-2035.', false, false],
      [11, 'Vega Sicilia Único 2012', 'Optimal Drinking', 'medium', 'Vega Sicilia Único 2012 reaching peak', 'Entering optimal maturity window now.', false, false],
      [12, 'Clase Azul Reposado', 'Reorder Needed', 'medium', 'Clase Azul stock below reorder point', 'Only 5 bottles. Reorder threshold is 6.', false, false],
      [2, 'Opus One 2018', 'Temperature Alert', 'high', 'Cellar A temperature spike detected', 'Temperature reached 17°C in Cellar A. Target is 13-15°C.', false, false],
      [14, 'Krug Grande Cuvée', 'Low Stock', 'medium', 'Krug Grande Cuvée running low', '4 bottles remaining. Consider reordering.', false, false],
      [5, 'Sassicaia 2019', 'Value Increase', 'low', 'Sassicaia 2019 steady appreciation', 'Up 14% from purchase price. Super Tuscan demand rising.', true, true],
      [13, 'Tignanello 2020', 'Drink Window Opening', 'low', 'Tignanello 2020 approaching readiness', 'Starting to enter drinking window 2024-2035.', true, false],
      [18, 'Château d\'Yquem 2017', 'Investment Alert', 'medium', 'Château d\'Yquem 2017 strong auction results', 'Recent auction at $440, above current valuation.', false, false],
      [15, 'Caymus Special Selection 2019', 'Reorder Needed', 'medium', 'Caymus SS popular - stock decreasing', '6 bottles left. High customer demand this season.', false, false]
    ];
    for (const a of cellarAlerts) {
      await client.query(`INSERT INTO cellar_alerts (inventory_id, wine_name, alert_type, severity, message, details, is_read, is_resolved) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`, a);
    }
    console.log('Cellar alerts seeded: 16 items');

    // Seed Sales (16 items)
    const sales = [
      [1, 'Château Margaux 2015', 'Le Bernardin Restaurant', 'Restaurant', 1, 950.00, 950.00, 450.00, 500.00, 'wholesale', '2024-11-15', 'Wire Transfer', 'Sold to Michelin-star restaurant'],
      [6, 'Cloudy Bay Sauvignon Blanc 2023', 'Walk-in Customer', 'Retail', 2, 28.00, 56.00, 22.00, 12.00, 'retail', '2024-12-01', 'Credit Card', 'Regular weekend sale'],
      [3, 'Dom Pérignon 2012', 'Corporate Event Co.', 'Event/Catering', 4, 340.00, 1360.00, 220.00, 480.00, 'event', '2024-12-20', 'Invoice', 'NYE corporate gala order'],
      [13, 'Tignanello 2020', 'The Capital Grille', 'Restaurant', 3, 135.00, 405.00, 95.00, 120.00, 'wholesale', '2024-10-22', 'Wire Transfer', 'Monthly restaurant order'],
      [16, 'Whispering Angel Rosé 2023', 'Summer Beach Club', 'Event/Catering', 12, 26.00, 312.00, 18.00, 96.00, 'event', '2024-07-04', 'Credit Card', 'July 4th event'],
      [2, 'Opus One 2018', 'Robert Chen', 'Private Collector', 2, 440.00, 880.00, 380.00, 120.00, 'retail', '2024-09-10', 'Credit Card', 'Collector purchase'],
      [15, 'Caymus Special Selection 2019', 'Wine Club Member', 'Wine Club', 1, 220.00, 220.00, 180.00, 40.00, 'retail', '2024-11-01', 'Credit Card', 'Monthly club allocation'],
      [5, 'Sassicaia 2019', 'Ristorante Milano', 'Restaurant', 2, 350.00, 700.00, 280.00, 140.00, 'wholesale', '2024-10-05', 'Invoice', 'Italian restaurant wine list'],
      [6, 'Cloudy Bay Sauvignon Blanc 2023', 'Online Order #1247', 'Retail', 6, 28.00, 168.00, 22.00, 36.00, 'online', '2024-11-20', 'Credit Card', 'Online case purchase'],
      [7, 'Hennessy XO Cognac', 'The Ritz Bar', 'Restaurant', 2, 240.00, 480.00, 180.00, 120.00, 'wholesale', '2024-08-15', 'Wire Transfer', 'Bar program order'],
      [10, 'Puligny-Montrachet 2020', 'Sarah Williams', 'Private Collector', 2, 235.00, 470.00, 180.00, 110.00, 'retail', '2024-09-28', 'Credit Card', 'White Burgundy enthusiast'],
      [12, 'Clase Azul Reposado', 'Nobu Restaurant', 'Restaurant', 1, 215.00, 215.00, 170.00, 45.00, 'wholesale', '2024-11-08', 'Invoice', 'Premium tequila program'],
      [4, 'Penfolds Grange 2017', 'Auction House Sale', 'Private Collector', 1, 720.00, 720.00, 550.00, 170.00, 'retail', '2024-12-10', 'Wire Transfer', 'Collector auction purchase'],
      [16, 'Whispering Angel Rosé 2023', 'By-the-Glass Program', 'Restaurant', 6, 8.00, 288.00, 18.00, 180.00, 'by-the-glass', '2024-08-01', 'Internal', 'BTG revenue (36 glasses from 6 bottles)'],
      [14, 'Krug Grande Cuvée', 'Wedding Party', 'Event/Catering', 2, 310.00, 620.00, 250.00, 120.00, 'event', '2024-06-15', 'Wire Transfer', 'Luxury wedding reception'],
      [8, 'Macallan 18 Year', 'VIP Lounge Service', 'Restaurant', 1, 450.00, 450.00, 320.00, 130.00, 'by-the-glass', '2024-10-31', 'Credit Card', 'Premium whisky service']
    ];
    for (const s of sales) {
      await client.query(`INSERT INTO sales (inventory_id, wine_name, customer_name, customer_type, quantity_sold, unit_price, total_amount, cost_basis, profit, sale_type, sale_date, payment_method, notes) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)`, s);
    }
    console.log('Sales seeded: 16 items');

    // Seed Cocktail Recipes (16 items)
    const cocktails = [
      ['Sidecar', 'Cognac', 'Classic', 'Easy', '5 min', '2 oz Cognac, 1 oz Cointreau, 3/4 oz fresh lemon juice', 'Shake all ingredients with ice. Strain into a sugar-rimmed coupe glass.', 'Sugar rim, lemon twist', 'Coupe', 'Citrusy, warming, elegant', 'Dinner party, Date night'],
      ['Rob Roy', 'Scotch', 'Classic', 'Easy', '3 min', '2 oz blended Scotch, 1 oz sweet vermouth, 2 dashes Angostura bitters', 'Stir all ingredients with ice. Strain into a chilled cocktail glass.', 'Maraschino cherry', 'Cocktail glass', 'Smoky, sweet, herbal', 'After dinner, Cigar pairing'],
      ['Margarita Reposado', 'Tequila', 'Classic', 'Easy', '5 min', '2 oz reposado tequila, 1 oz fresh lime juice, 3/4 oz agave syrup, pinch of salt', 'Shake vigorously with ice. Strain into a salt-rimmed rocks glass over fresh ice.', 'Lime wheel, salt rim', 'Rocks glass', 'Citrusy, smooth, sweet-tart', 'Celebration, Mexican cuisine'],
      ['Japanese Highball', 'Japanese Whisky', 'Modern Classic', 'Medium', '3 min', '2 oz Japanese whisky, 4 oz chilled soda water', 'Fill a chilled highball glass with ice. Pour whisky, then soda. Stir gently exactly 13.5 times.', 'Lemon peel twist', 'Highball', 'Light, refreshing, clean', 'Any occasion, Summer'],
      ['Champagne Cocktail', 'Champagne', 'Classic', 'Easy', '2 min', '1 sugar cube, 3 dashes Angostura bitters, Champagne to top, 1/2 oz Cognac', 'Place sugar cube in flute. Dash bitters onto cube. Pour Cognac, top with Champagne.', 'Lemon twist', 'Champagne flute', 'Effervescent, aromatic, celebratory', 'Celebration, New Years'],
      ['Mulled Wine', 'Red Wine', 'Seasonal', 'Easy', '20 min', '1 bottle red wine, 1/4 cup brandy, 1 orange, 8 cloves, 2 cinnamon sticks, 3 star anise, 1/4 cup honey', 'Combine all in saucepan. Heat gently without boiling for 15 minutes. Strain and serve warm.', 'Orange slice, cinnamon stick', 'Heatproof mug', 'Warm, spiced, aromatic', 'Winter, Holiday, Fireside'],
      ['Frosé', 'Rosé', 'Modern', 'Medium', '4 hours', '1 bottle rosé, 1/2 cup sugar, 1/2 cup water, 4 oz strawberry puree, 2 oz lemon juice', 'Make simple syrup. Mix with rosé, strawberry puree, and lemon. Freeze 4 hours. Blend until slushy.', 'Fresh strawberry', 'Wine glass', 'Frozen, fruity, refreshing', 'Summer, Pool party, Brunch'],
      ['Vieux Carré', 'Cognac', 'Classic', 'Medium', '5 min', '3/4 oz Cognac, 3/4 oz rye whiskey, 3/4 oz sweet vermouth, 1 tsp Bénédictine, 2 dashes Peychaud bitters, 2 dashes Angostura', 'Stir all ingredients with ice. Strain into a rocks glass over a large ice cube.', 'Lemon peel', 'Rocks glass', 'Complex, herbal, rich', 'After dinner, Sophisticated evening'],
      ['Penicillin', 'Scotch', 'Modern Classic', 'Medium', '5 min', '2 oz blended Scotch, 3/4 oz lemon juice, 3/4 oz honey-ginger syrup, 1/4 oz Islay Scotch float', 'Shake Scotch, lemon, and syrup with ice. Strain. Float Islay Scotch on top.', 'Candied ginger', 'Rocks glass', 'Smoky, sweet, spicy, citrus', 'Cold weather, Recovery'],
      ['Paloma', 'Tequila', 'Classic', 'Easy', '3 min', '2 oz tequila, 4 oz grapefruit soda, 1/2 oz lime juice, pinch of salt', 'Build over ice in a salt-rimmed highball glass. Stir gently.', 'Grapefruit wedge, salt rim', 'Highball', 'Citrusy, bitter-sweet, refreshing', 'Summer, BBQ, Mexican food'],
      ['Whisky Sour Japanese', 'Japanese Whisky', 'Modern', 'Medium', '5 min', '2 oz Japanese whisky, 1 oz lemon juice, 3/4 oz simple syrup, 1 egg white, 2 dashes Angostura', 'Dry shake without ice, then shake with ice. Strain into coupe. Dash bitters on foam.', 'Bitters art on foam', 'Coupe', 'Citrusy, silky, balanced', 'Cocktail hour, Dinner party'],
      ['Kir Royale', 'Champagne', 'Classic', 'Easy', '1 min', '5 oz Champagne, 1/2 oz crème de cassis', 'Pour cassis into flute. Top with chilled Champagne.', 'Fresh blackberry or raspberry', 'Champagne flute', 'Sweet, berry, effervescent', 'Aperitif, Brunch, Celebration'],
      ['Sangria Luxe', 'Red Wine', 'Modern', 'Easy', '2 hours', '1 bottle red wine, 1/4 cup brandy, 1/4 cup orange liqueur, 1 cup mixed berries, 1 orange sliced, 2 tbsp sugar, 1 cup soda', 'Combine all except soda. Refrigerate 2 hours. Add soda and ice when serving.', 'Fresh fruit slices', 'Pitcher/wine glass', 'Fruity, refreshing, sweet', 'Summer party, BBQ, Gatherings'],
      ['French 75', 'Champagne', 'Classic', 'Easy', '5 min', '1 oz gin, 1/2 oz lemon juice, 1/2 oz simple syrup, 3 oz Champagne', 'Shake gin, lemon, syrup with ice. Strain into flute. Top with Champagne.', 'Lemon twist', 'Champagne flute', 'Effervescent, citrusy, elegant', 'Celebration, Brunch, Date night'],
      ['Sazerac', 'Cognac', 'Classic', 'Advanced', '5 min', '2 oz Cognac (or rye), 1 sugar cube, 3 dashes Peychaud bitters, absinthe rinse', 'Rinse chilled glass with absinthe. Muddle sugar and bitters. Add Cognac and ice, stir. Strain into prepared glass.', 'Lemon peel (expressed, discarded)', 'Rocks glass', 'Complex, anise, herbal, rich', 'After dinner, Sophisticated occasion'],
      ['Espresso Martini Twist', 'Japanese Whisky', 'Modern', 'Advanced', '5 min', '1.5 oz Japanese whisky, 1 oz fresh espresso, 3/4 oz coffee liqueur, 1/2 oz simple syrup, pinch of matcha', 'Shake all vigorously with ice. Double strain into a chilled coupe.', 'Three coffee beans, matcha dust', 'Coupe', 'Coffee, rich, smooth, umami', 'After dinner, Late night']
    ];
    for (const c of cocktails) {
      await client.query(`INSERT INTO cocktail_recipes (name, spirit_base, category, difficulty, prep_time, ingredients, instructions, garnish, glassware, flavor_profile, occasion) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`, c);
    }
    console.log('Cocktail recipes seeded: 16 items');

    // Seed Suppliers (16 items)
    const suppliers = [
      ['Bordeaux Direct Imports', 'Jean-Pierre Moreau', 'jp@bordeauxdirect.fr', '+33-5-56-00-1234', '15 Rue du Commerce, Bordeaux', 'Bordeaux', 'France', 'Bordeaux Grand Cru, First Growths', 9.2, 'Net 30', 2000.00, 14, true, 'Premier Bordeaux supplier, direct from chateaux'],
      ['Napa Valley Cellars', 'Michael Torres', 'mt@napavalleycellars.com', '+1-707-555-0123', '100 Wine Country Rd, Napa', 'Napa', 'USA', 'Premium Napa Cabernet, Cult wines', 8.8, 'Net 15', 1500.00, 7, true, 'Top Napa Valley distributor'],
      ['Italian Wine Merchants', 'Sofia Rossi', 'sofia@italianwine.it', '+39-011-555-0456', 'Via Roma 42, Turin', 'Turin', 'Italy', 'Barolo, Brunello, Super Tuscan', 9.5, 'Net 45', 3000.00, 21, true, 'Best Italian fine wine source'],
      ['Champagne House Direct', 'Marie Lefebvre', 'marie@champagnehouse.fr', '+33-3-26-55-0789', '8 Avenue de Champagne, Épernay', 'Épernay', 'France', 'Prestige Champagne, Grower Champagne', 9.0, 'Net 30', 5000.00, 10, true, 'Direct Champagne access'],
      ['Premium Spirits Co.', 'David MacAllister', 'david@premiumspirits.co.uk', '+44-20-7946-0958', '25 St James Sq, London', 'London', 'UK', 'Single Malt Scotch, Rare Whisky', 8.7, 'Net 30', 2500.00, 14, true, 'Rare spirits specialist'],
      ['Southern Hemisphere Wines', 'James Cook', 'james@southernwines.com.au', '+61-8-8555-0321', '200 Barossa Way, Tanunda', 'Barossa Valley', 'Australia', 'Australian Shiraz, NZ Sauvignon Blanc', 8.5, 'Net 30', 1000.00, 28, true, 'Australia and NZ specialist'],
      ['Burgundy Selections', 'Pierre Duval', 'pierre@burgundyselect.fr', '+33-3-80-55-0654', '12 Rue des Vignes, Beaune', 'Beaune', 'France', 'Grand Cru Burgundy, Premier Cru', 9.8, 'COD', 10000.00, 21, true, 'Ultra-premium Burgundy only'],
      ['Iberian Wine Group', 'Carlos Mendez', 'carlos@iberianwine.es', '+34-91-555-0987', 'Calle Mayor 55, Madrid', 'Madrid', 'Spain', 'Rioja, Ribera del Duero, Port', 8.6, 'Net 30', 1500.00, 18, true, 'Spanish and Portuguese specialist'],
      ['Pacific Rim Imports', 'Yuki Tanaka', 'yuki@pacificrim.jp', '+81-3-5555-0147', '3-5-1 Ginza, Chuo-ku', 'Tokyo', 'Japan', 'Japanese Whisky, Sake', 9.1, 'Prepaid', 5000.00, 30, true, 'Japanese spirits expert'],
      ['Agave Spirits International', 'Luis Hernandez', 'luis@agavespirits.mx', '+52-33-555-0258', 'Av Vallarta 1200, Guadalajara', 'Guadalajara', 'Mexico', 'Premium Tequila, Mezcal', 8.4, 'Net 15', 800.00, 12, true, 'Artisanal agave spirits'],
      ['Rhine & Mosel Imports', 'Hans Weber', 'hans@rhineimports.de', '+49-6131-555-0369', 'Mainzer Str. 8, Wiesbaden', 'Wiesbaden', 'Germany', 'Riesling, German wines', 8.3, 'Net 30', 1200.00, 14, true, 'German wine specialist'],
      ['Loire Valley Selections', 'Isabelle Martin', 'isabelle@loirevalley.fr', '+33-2-41-55-0741', '5 Place du Château, Saumur', 'Saumur', 'France', 'Loire whites, Chenin Blanc', 8.1, 'Net 30', 800.00, 12, true, 'Loire Valley focus'],
      ['Cognac & Armagnac Direct', 'François Dupont', 'francois@cognacdir.fr', '+33-5-45-55-0852', '22 Rue Cognac, Cognac', 'Cognac', 'France', 'Cognac, Armagnac, French brandy', 9.3, 'Net 45', 3000.00, 14, true, 'Premier French brandy house'],
      ['South American Vines', 'Maria Gonzalez', 'maria@savines.cl', '+56-2-555-0963', 'Av Apoquindo 4500, Santiago', 'Santiago', 'Chile', 'Chilean Cabernet, Argentine Malbec', 8.0, 'Net 30', 600.00, 25, true, 'South American wines'],
      ['Organic & Biodynamic Wines', 'Eva Lindström', 'eva@organicwines.se', '+46-8-555-0159', 'Storgatan 15, Stockholm', 'Stockholm', 'Sweden', 'Natural wine, Organic, Biodynamic', 8.2, 'Net 15', 500.00, 10, true, 'Natural wine movement specialist'],
      ['Fortified Wine House', 'Antonio Porto', 'antonio@fortifiedhouse.pt', '+351-22-555-0753', 'Rua do Vinho 8, Vila Nova de Gaia', 'Porto', 'Portugal', 'Port, Sherry, Madeira', 8.9, 'Net 30', 1000.00, 16, true, 'Fortified wine expert']
    ];
    for (const s of suppliers) {
      await client.query(`INSERT INTO suppliers (company_name, contact_name, email, phone, address, city, country, specialization, rating, payment_terms, minimum_order, lead_time_days, is_active, notes) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)`, s);
    }
    console.log('Suppliers seeded: 16 items');

    // Seed Wine Events (16 items)
    const wineEvents = [
      ['Annual Grand Cru Tasting', 'Tasting', '2024-11-15', 'The Wine Cellar Gallery', 'Premium tasting of 2015 Bordeaux vintage across all classifications', 'Margaux 2015, Latour 2015, Mouton Rothschild 2015, Haut-Brion 2015', 45, 2500.00, 8500.00, 9.4, 'Exceptional turnout. Margaux was crowd favorite.', 'Sold 12 bottles during event'],
      ['Sommelier Certification Workshop', 'Education', '2024-10-20', 'Wine Academy Downtown', 'WSET Level 3 preparation intensive workshop', 'Various old and new world wines for blind tasting', 20, 1200.00, 4000.00, 8.8, 'All participants passed mock exam', '3 students went on to pass certification'],
      ['Italian Wine Dinner', 'Dinner', '2024-09-28', 'Ristorante La Piazza', 'Five-course dinner paired with Super Tuscan wines', 'Sassicaia 2019, Tignanello 2020, Ornellaia 2018, Solaia 2019', 32, 3200.00, 9600.00, 9.6, 'Chef Matteo created exceptional pairings', 'Waitlist of 15 people for next event'],
      ['New World vs Old World Blind Tasting', 'Tasting', '2024-08-10', 'The Wine Cellar Gallery', 'Blind tasting competition: New World vs Old World Cab Sauv', 'Opus One, Margaux, Sassicaia, Penfolds, Caymus, Vega Sicilia', 30, 1800.00, 5400.00, 9.0, 'Old World won 4-2 in blind votes', 'Great engagement on social media'],
      ['Champagne Brunch', 'Brunch', '2024-12-15', 'Skyline Terrace Restaurant', 'Luxury Champagne brunch featuring prestige cuvées', 'Dom Pérignon 2012, Krug Grande Cuvée, Salon 2012', 24, 2800.00, 7200.00, 9.2, 'Stunning venue. DP 2012 was star of the show.', 'Repeat booking confirmed for spring'],
      ['Whisky Masterclass', 'Education', '2024-07-20', 'The Spirits Library', 'Japanese whisky vs Scottish single malt masterclass', 'Yamazaki 12, Macallan 18, Hibiki 21, Glenfiddich 18', 18, 900.00, 3600.00, 9.1, 'Yamazaki surprised many seasoned whisky drinkers', 'Sold all remaining Yamazaki stock'],
      ['Harvest Season Celebration', 'Festival', '2024-10-05', 'Vineyard Estate Grounds', 'Annual harvest festival with grape stomping and tastings', 'Various wines from partner vineyards', 120, 5000.00, 18000.00, 8.7, 'Great weather, family-friendly atmosphere', 'Biggest event of the year'],
      ['Bordeaux Futures Tasting', 'Tasting', '2024-04-15', 'The Wine Cellar Gallery', 'En primeur tasting of 2023 Bordeaux vintage from barrel', 'Barrel samples from 12 Bordeaux estates', 35, 1500.00, 42000.00, 8.5, 'Strong vintage. Good buying opportunities.', 'Secured 50 cases in futures orders'],
      ['Valentines Wine & Chocolate Pairing', 'Pairing', '2024-02-14', 'Artisan Chocolatier Studio', 'Romantic evening pairing premium chocolates with wines', 'Port, Sauternes, Banyuls, Champagne rosé', 40, 1600.00, 6000.00, 9.3, 'Perfect date night concept. Fully booked.', 'Planning chocolate Easter edition'],
      ['Natural Wine Pop-Up', 'Pop-Up', '2024-06-22', 'Urban Warehouse Space', 'Showcase of natural, organic, and biodynamic wines', 'Various natural wines from 8 producers', 65, 2200.00, 7800.00, 8.2, 'Younger demographic very engaged', 'Good for brand awareness'],
      ['Private Collector Preview', 'Private', '2024-11-30', 'Penthouse Suite', 'Exclusive preview of rare wines for top collectors', 'DRC, Screaming Eagle, Petrus, Salon', 12, 800.00, 35000.00, 9.8, 'Sold Petrus and 2 cases of Salon', 'Most profitable event per person'],
      ['Wine & Yoga Retreat', 'Wellness', '2024-05-18', 'Hilltop Wellness Center', 'Morning yoga followed by mindful wine tasting', 'Light whites and rosés, organic selections', 25, 1100.00, 3750.00, 8.0, 'Unique concept drew new audience', 'Monthly series started'],
      ['Staff Training: Service Excellence', 'Training', '2024-09-05', 'In-House Training Room', 'Wine service standards and decanting techniques training', 'Various wines for practice service', 8, 400.00, 0.00, 8.6, 'Team improved blind tasting scores by 30%', 'Quarterly training scheduled'],
      ['Summer Rosé Festival', 'Festival', '2024-07-06', 'Rooftop Garden Bar', 'All-day rosé festival featuring Provence and beyond', 'Whispering Angel, Miraval, Domaine Ott, Bandol rosé', 85, 3500.00, 12750.00, 8.9, 'Amazing atmosphere. DJ added great vibe.', 'Annual event confirmed'],
      ['Vintage Port Retrospective', 'Tasting', '2024-03-20', 'The Port House', 'Vertical tasting of vintage Port from 1977 to 2017', 'Taylor, Graham, Fonseca vintage ports', 22, 1800.00, 5280.00, 9.5, 'The 1977 Taylor was extraordinary', 'Rare opportunity, repeat unlikely'],
      ['Tequila & Mezcal Experience', 'Education', '2024-08-25', 'The Agave Lounge', 'Exploring agave spirits from traditional to premium', 'Clase Azul, Don Julio 1942, Del Maguey, Fortaleza', 28, 1000.00, 4200.00, 8.8, 'Mezcal interest growing rapidly', 'Added mezcal to permanent menu']
    ];
    for (const e of wineEvents) {
      await client.query(`INSERT INTO wine_events (title, event_type, event_date, location, description, wines_featured, attendees, cost, revenue, rating, highlights, notes) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`, e);
    }
    console.log('Wine events seeded: 16 items');

    // Seed Customers (16 items)
    const customers = [
      ['Robert Chen', 'robert.chen@email.com', '+1-555-0101', 'Private Collector', 'Chen Capital Partners', 'Investment-grade Bordeaux and Burgundy', 'Bordeaux, Burgundy', 'Cabernet Sauvignon, Pinot Noir', '$500-5000', 12500.00, 15, '2024-12-01', true, 'Top collector client. Interested in en primeur.'],
      ['Sarah Williams', 'sarah.w@email.com', '+1-555-0102', 'Enthusiast', '', 'White Burgundy, Loire Valley whites', 'Burgundy, Loire', 'Chardonnay, Chenin Blanc', '$50-300', 3200.00, 22, '2024-11-28', false, 'Passionate about white wines. Hosts monthly wine club.'],
      ['Le Bernardin Restaurant', 'wine@lebernadin.com', '+1-555-0103', 'Restaurant', 'Le Bernardin', 'Fine wine for Michelin program', 'Bordeaux, Burgundy, Champagne', 'Mixed', '$200-2000', 45000.00, 48, '2024-12-10', true, 'Three-Michelin-star. Monthly orders.'],
      ['The Capital Grille', 'bevdir@capitalgrille.com', '+1-555-0104', 'Restaurant', 'Capital Grille Group', 'Premium by-the-glass program', 'Napa, Tuscany', 'Cabernet, Sangiovese', '$80-400', 28000.00, 36, '2024-12-05', true, 'Chain account. Consistent orders.'],
      ['James Morrison', 'james.m@email.com', '+1-555-0105', 'Wine Club', '', 'Monthly curated selections', 'Various', 'Various', '$100-500', 6800.00, 24, '2024-12-01', false, 'Wine club founding member. Loves variety.'],
      ['Corporate Events Inc.', 'events@corpevents.com', '+1-555-0106', 'Event/Catering', 'Corporate Events Inc.', 'Premium wines for corporate events', 'Champagne, Napa', 'Champagne, Cab Sauv', '$100-500', 18500.00, 12, '2024-12-20', true, 'Large volume event orders.'],
      ['Maria Santos', 'maria.s@email.com', '+1-555-0107', 'Enthusiast', '', 'Spanish and Portuguese wines', 'Rioja, Ribera del Duero', 'Tempranillo, Touriga', '$30-200', 2100.00, 18, '2024-11-15', false, 'Iberian wine enthusiast. Attends all Spanish events.'],
      ['Nobu Restaurant', 'wine@nobu.com', '+1-555-0108', 'Restaurant', 'Nobu Hospitality', 'Japanese whisky, sake, premium spirits', 'Japan, Various', 'Japanese Whisky, Sake', '$100-800', 22000.00, 30, '2024-12-08', true, 'Premium spirits account.'],
      ['David Park', 'david.p@email.com', '+1-555-0109', 'Private Collector', 'Park Ventures', 'Cult California wines', 'Napa, Sonoma', 'Cabernet, Pinot Noir', '$200-4000', 15800.00, 10, '2024-11-20', true, 'Screaming Eagle, Opus One, Harlan collector.'],
      ['Summer Beach Club', 'bar@summerbeach.com', '+1-555-0110', 'Event/Catering', 'Summer Beach Club', 'Seasonal rosé and sparkling', 'Provence, Champagne', 'Rosé, Sparkling', '$20-100', 8500.00, 8, '2024-09-30', false, 'Seasonal account. May-September only.'],
      ['Wine Importers Group', 'buy@wineimporters.com', '+1-555-0111', 'Wholesale', 'Wine Importers LLC', 'Bulk purchasing for redistribution', 'Various', 'Various', '$50-500', 52000.00, 24, '2024-12-12', true, 'Large wholesale account.'],
      ['The Ritz Bar', 'bar@ritzhotel.com', '+1-555-0112', 'Restaurant', 'The Ritz Hotel', 'Premium spirits and Champagne', 'Champagne, Cognac, Scotland', 'Champagne, Cognac, Whisky', '$200-1000', 35000.00, 36, '2024-12-15', true, 'Luxury hotel bar program.'],
      ['Emily Watson', 'emily.w@email.com', '+1-555-0113', 'Wine Club', '', 'Natural and biodynamic wines', 'Various', 'Various natural', '$20-80', 1800.00, 14, '2024-12-01', false, 'Natural wine enthusiast. Young professional.'],
      ['Alessandro Bianchi', 'alex.b@email.com', '+1-555-0114', 'Private Collector', 'Bianchi Holdings', 'Italian fine wine, Super Tuscans', 'Tuscany, Piedmont', 'Nebbiolo, Sangiovese', '$100-2000', 19500.00, 20, '2024-11-25', true, 'Italian wine specialist collector.'],
      ['Wedding Planners Elite', 'orders@weddingselite.com', '+1-555-0115', 'Event/Catering', 'Wedding Planners Elite', 'Champagne and celebration wines', 'Champagne', 'Champagne, Prosecco', '$50-400', 14000.00, 16, '2024-12-18', false, 'Seasonal wedding business.'],
      ['Michael OBrien', 'michael.ob@email.com', '+1-555-0116', 'Enthusiast', '', 'Scotch whisky and Irish whiskey', 'Scotland, Ireland', 'Single Malt, Blend', '$80-600', 4200.00, 12, '2024-12-02', false, 'Whisky enthusiast. Attends all masterclasses.']
    ];
    for (const c of customers) {
      await client.query(`INSERT INTO customers (name, email, phone, customer_type, company, preferences, favorite_regions, favorite_varietals, budget_range, total_purchases, visit_count, last_visit, vip_status, notes) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)`, c);
    }
    console.log('Customers seeded: 16 items');

    // Seed Wishlist (16 items)
    const wishlistItems = [
      ['Screaming Eagle Cabernet 2020', 'Screaming Eagle', 2020, 'Napa Valley', 'USA', 4000.00, 'high', 'Trophy wine for collection', 'Mailing list allocation', 1, 'searching', 'Applied to mailing list'],
      ['Romanée-Conti 2019', 'DRC', 2019, 'Burgundy', 'France', 25000.00, 'high', 'Ultimate Burgundy for investment', 'Auction houses', 1, 'searching', 'Monitoring auction schedules'],
      ['Harlan Estate 2019', 'Harlan Estate', 2019, 'Napa Valley', 'USA', 1200.00, 'high', 'Cult Napa collector wine', 'Mailing list', 2, 'searching', 'On waitlist for allocation'],
      ['Pétrus 2018', 'Pétrus', 2018, 'Pomerol', 'France', 4500.00, 'medium', 'Right bank Bordeaux icon', 'Merchant contacts', 1, 'identified', 'Found potential source in London'],
      ['Leroy Musigny 2019', 'Domaine Leroy', 2019, 'Burgundy', 'France', 8000.00, 'medium', 'Rare Burgundy Grand Cru', 'Auction', 1, 'searching', 'Extremely rare allocation'],
      ['Masseto 2020', 'Masseto', 2020, 'Tuscany', 'Italy', 600.00, 'medium', 'Premier Italian Merlot', 'Italian importers', 2, 'identified', 'Italian Wine Merchants may have stock'],
      ['Yamazaki 25 Year', 'Suntory', null, 'Japan', 'Japan', 5000.00, 'high', 'Ultra-premium Japanese whisky', 'Pacific Rim Imports', 1, 'searching', 'Nearly impossible to source'],
      ['Cristal 2014', 'Louis Roederer', 2014, 'Champagne', 'France', 350.00, 'low', 'Prestige Champagne for events', 'Champagne suppliers', 3, 'ordered', 'Ordered from Champagne House Direct'],
      ['Guigal La La La Collection', 'E. Guigal', 2019, 'Northern Rhône', 'France', 800.00, 'medium', 'La Mouline, La Landonne, La Turque set', 'Rhône specialists', 1, 'searching', 'Looking for complete set'],
      ['Opus One 2020', 'Opus One', 2020, 'Napa Valley', 'USA', 400.00, 'low', 'Restock popular seller', 'Napa Valley Cellars', 6, 'ordered', 'Delivery expected next month'],
      ['Sine Qua Non Syrah 2021', 'Sine Qua Non', 2021, 'Central Coast', 'USA', 500.00, 'medium', 'Cult California Syrah', 'Mailing list', 2, 'searching', 'Applied to mailing list 2 years ago'],
      ['Salon Le Mesnil 2013', 'Salon', 2013, 'Champagne', 'France', 700.00, 'medium', 'Single vineyard prestige Champagne', 'Auction, Champagne direct', 2, 'identified', 'Spotted at UK auction house'],
      ['Pappy Van Winkle 23 Year', 'Old Rip Van Winkle', null, 'Kentucky', 'USA', 3000.00, 'high', 'Iconic American bourbon', 'Allocated distributor', 1, 'searching', 'Lottery system - entered annually'],
      ['Château Latour 2015', 'Château Latour', 2015, 'Pauillac', 'France', 700.00, 'medium', 'First Growth from great vintage', 'Bordeaux Direct Imports', 3, 'identified', 'JP Moreau locating stock'],
      ['Gaja Barbaresco 2019', 'Gaja', 2019, 'Piedmont', 'Italy', 350.00, 'low', 'Iconic Piedmont producer', 'Italian Wine Merchants', 2, 'ordered', 'Sofia confirmed 2 bottles available'],
      ['Cloudy Bay Te Koko 2020', 'Cloudy Bay', 2020, 'Marlborough', 'New Zealand', 45.00, 'low', 'Premium oak-aged Sauvignon Blanc', 'Southern Hemisphere Wines', 6, 'acquired', 'Received and added to cellar']
    ];
    for (const w of wishlistItems) {
      await client.query(`INSERT INTO wishlist (wine_name, producer, vintage, region, country, estimated_price, priority, reason, source, target_quantity, status, notes) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`, w);
    }
    console.log('Wishlist seeded: 16 items');

    // Seed Temperature Log (16 items)
    const tempLogs = [
      ['Cellar A - Main', 13.5, 68.0, 13.0, 65.0, 'normal', '2024-12-20 08:00:00'],
      ['Cellar A - Main', 13.8, 67.5, 13.0, 65.0, 'normal', '2024-12-20 14:00:00'],
      ['Cellar A - Main', 17.2, 72.0, 13.0, 65.0, 'warning', '2024-12-19 15:30:00'],
      ['Cellar A - Main', 13.2, 66.0, 13.0, 65.0, 'normal', '2024-12-19 08:00:00'],
      ['Cellar B - Sparkling', 10.5, 70.0, 10.0, 70.0, 'normal', '2024-12-20 08:00:00'],
      ['Cellar B - Sparkling', 10.8, 69.5, 10.0, 70.0, 'normal', '2024-12-20 14:00:00'],
      ['Cellar B - Sparkling', 11.5, 71.0, 10.0, 70.0, 'warning', '2024-12-18 16:00:00'],
      ['Cellar C - White Wine', 8.0, 72.0, 8.0, 70.0, 'normal', '2024-12-20 08:00:00'],
      ['Cellar C - White Wine', 8.3, 71.0, 8.0, 70.0, 'normal', '2024-12-20 14:00:00'],
      ['Spirit Cabinet', 18.0, 55.0, 18.0, 55.0, 'normal', '2024-12-20 08:00:00'],
      ['Spirit Cabinet', 18.5, 56.0, 18.0, 55.0, 'normal', '2024-12-20 14:00:00'],
      ['Cellar A - Main', 14.0, 68.0, 13.0, 65.0, 'normal', '2024-12-18 08:00:00'],
      ['Cellar A - Main', 13.0, 65.0, 13.0, 65.0, 'optimal', '2024-12-17 08:00:00'],
      ['Cellar C - White Wine', 9.2, 74.0, 8.0, 70.0, 'warning', '2024-12-17 14:00:00'],
      ['Cellar B - Sparkling', 10.0, 70.0, 10.0, 70.0, 'optimal', '2024-12-17 08:00:00'],
      ['Spirit Cabinet', 19.5, 58.0, 18.0, 55.0, 'warning', '2024-12-16 14:00:00']
    ];
    for (const t of tempLogs) {
      await client.query(`INSERT INTO temperature_log (zone_name, temperature, humidity, target_temp, target_humidity, status, reading_time) VALUES ($1,$2,$3,$4,$5,$6,$7)`, t);
    }
    console.log('Temperature log seeded: 16 items');

    // Seed Deliveries (16 items)
    const deliveries = [
      [1, 'Bordeaux Direct Imports', 'BDX-2024-0847', 'delivered', 'Château Margaux 2015 x2, Château Latour 2016 x3', 5, 4200.00, '2024-10-01', '2024-10-15', '2024-10-14', 'FR-TRACK-847291', 'Arrived in perfect condition'],
      [2, 'Napa Valley Cellars', 'NVC-2024-1234', 'delivered', 'Opus One 2018 x6, Caymus SS 2019 x6', 12, 5280.00, '2024-11-01', '2024-11-08', '2024-11-07', 'US-TRACK-123456', 'All bottles intact'],
      [3, 'Italian Wine Merchants', 'IWM-2024-0567', 'delivered', 'Sassicaia 2019 x4, Tignanello 2020 x6', 10, 1690.00, '2024-09-15', '2024-10-05', '2024-10-03', 'IT-TRACK-567890', 'Minor delay but good condition'],
      [4, 'Champagne House Direct', 'CHD-2024-0891', 'in_transit', 'Dom Pérignon 2012 x6, Krug Grande Cuvée x4', 10, 2280.00, '2024-12-10', '2024-12-24', null, 'FR-TRACK-891234', 'Holiday order - temperature controlled'],
      [5, 'Premium Spirits Co.', 'PSC-2024-0345', 'delivered', 'Macallan 18 Year x2, Highland Park 25 x1', 3, 1640.00, '2024-11-15', '2024-11-28', '2024-11-27', 'UK-TRACK-345678', 'Rare allocation secured'],
      [6, 'Southern Hemisphere Wines', 'SHW-2024-0678', 'delivered', 'Cloudy Bay SB 2023 x24, Penfolds Grange 2017 x2', 26, 1628.00, '2024-08-20', '2024-09-15', '2024-09-18', 'AU-TRACK-678901', 'Delayed 3 days - customs'],
      [9, 'Pacific Rim Imports', 'PRI-2024-0912', 'pending', 'Yamazaki 12 Year x3, Hibiki 21 x1', 4, 1350.00, '2024-12-18', '2025-01-15', null, null, 'Pre-ordered for Q1 allocation'],
      [10, 'Agave Spirits International', 'ASI-2024-0234', 'delivered', 'Clase Azul Reposado x6, Don Julio 1942 x4', 10, 1620.00, '2024-10-10', '2024-10-22', '2024-10-21', 'MX-TRACK-234567', 'Perfect condition'],
      [7, 'Burgundy Selections', 'BES-2024-0456', 'in_transit', 'Puligny-Montrachet 2021 x6, Meursault 2020 x6', 12, 3600.00, '2024-12-05', '2024-12-26', null, 'FR-TRACK-456789', 'Premium allocation order'],
      [8, 'Iberian Wine Group', 'IWG-2024-0789', 'delivered', 'Vega Sicilia Único 2013 x2, Pingus 2020 x2', 4, 2800.00, '2024-09-01', '2024-09-18', '2024-09-17', 'ES-TRACK-789012', 'Excellent packaging'],
      [1, 'Bordeaux Direct Imports', 'BDX-2024-0963', 'processing', 'Château d\'Yquem 2018 x3, Lynch-Bages 2019 x6', 9, 3150.00, '2024-12-15', '2024-12-30', null, null, 'Year-end order. JP confirming stock.'],
      [13, 'Cognac & Armagnac Direct', 'CAD-2024-0147', 'delivered', 'Hennessy XO x6, Rémy Martin Louis XIII x1', 7, 3580.00, '2024-07-20', '2024-08-03', '2024-08-02', 'FR-TRACK-147258', 'VIP spirit order'],
      [4, 'Champagne House Direct', 'CHD-2024-0258', 'delivered', 'Whispering Angel Rosé 2023 x36', 36, 648.00, '2024-06-01', '2024-06-10', '2024-06-09', 'FR-TRACK-258369', 'Summer rosé stock'],
      [14, 'South American Vines', 'SAV-2024-0369', 'pending', 'Catena Zapata Malbec 2020 x12, Almaviva 2019 x4', 16, 1480.00, '2024-12-20', '2025-01-12', null, null, 'New supplier trial order'],
      [11, 'Rhine & Mosel Imports', 'RMI-2024-0741', 'delivered', 'Egon Müller Riesling 2022 x6, Dr. Loosen GG x6', 12, 1440.00, '2024-10-25', '2024-11-08', '2024-11-06', 'DE-TRACK-741852', 'Beautiful Riesling selection'],
      [3, 'Italian Wine Merchants', 'IWM-2024-0852', 'in_transit', 'Barolo Monfortino 2017 x2, Gaja Barbaresco 2019 x4', 6, 2560.00, '2024-12-12', '2025-01-02', null, 'IT-TRACK-852963', 'Premium Piedmont order']
    ];
    for (const d of deliveries) {
      await client.query(`INSERT INTO deliveries (supplier_id, supplier_name, order_number, status, items_description, total_bottles, total_cost, order_date, expected_date, delivered_date, tracking_number, notes) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`, d);
    }
    console.log('Deliveries seeded: 16 items');

    // Seed Staff (16 items)
    const staff = [
      ['James Sullivan', 'james.s@winesommelier.com', '+1-555-1001', 'Head Sommelier', 'Master Sommelier (CMS)', '2020-03-15', 'Bordeaux, Burgundy, Fine Wine Service', 85.00, true, 9.6, 'Lead sommelier. 20+ years experience.'],
      ['Maria Chen', 'maria.c@winesommelier.com', '+1-555-1002', 'Senior Sommelier', 'Advanced Sommelier (CMS)', '2021-06-01', 'New World wines, Wine education', 65.00, true, 9.2, 'Excellent palate. Leads training sessions.'],
      ['Sophie Laurent', 'sophie.l@winesommelier.com', '+1-555-1003', 'Sommelier', 'WSET Level 4 Diploma', '2022-01-10', 'White wines, Champagne, Loire Valley', 55.00, true, 8.8, 'French-born. Native expertise in French wines.'],
      ['Robert Kim', 'robert.k@winesommelier.com', '+1-555-1004', 'Sommelier', 'WSET Level 3', '2022-08-20', 'Australian wines, Bold reds', 50.00, true, 8.5, 'Studying for CMS Advanced exam.'],
      ['Isabella Rossi', 'isabella.r@winesommelier.com', '+1-555-1005', 'Wine Buyer', 'Italian Wine Scholar', '2021-02-01', 'Italian wines, Purchasing, Vendor management', 70.00, true, 9.0, 'Manages all Italian supplier relationships.'],
      ['Thomas Weber', 'thomas.w@winesommelier.com', '+1-555-1006', 'Cellar Manager', 'WSET Level 3', '2020-09-01', 'Inventory management, Temperature control', 60.00, true, 9.3, 'Meticulous cellar management. Systems expert.'],
      ['Akiko Tanaka', 'akiko.t@winesommelier.com', '+1-555-1007', 'Spirits Specialist', 'Sake Sommelier, Whisky Ambassador', '2023-01-15', 'Japanese whisky, Sake, Asian spirits', 55.00, true, 8.7, 'Unique expertise in Japanese beverages.'],
      ['Carlos Mendez', 'carlos.m@winesommelier.com', '+1-555-1008', 'Assistant Sommelier', 'WSET Level 2', '2023-06-01', 'Spanish wines, Tequila, Mezcal', 40.00, true, 8.0, 'Newest team member. Great with customers.'],
      ['Emma Thompson', 'emma.t@winesommelier.com', '+1-555-1009', 'Events Coordinator', 'WSET Level 2', '2021-11-01', 'Event planning, Customer engagement', 55.00, true, 9.1, 'Runs all wine events. Incredible organizer.'],
      ['David Park', 'david.p@winesommelier.com', '+1-555-1010', 'Sales Manager', 'WSET Level 3', '2020-06-15', 'B2B sales, Restaurant accounts', 75.00, true, 9.4, 'Manages all restaurant and wholesale accounts.'],
      ['Rachel Green', 'rachel.g@winesommelier.com', '+1-555-1011', 'Marketing Manager', '', '2022-04-01', 'Digital marketing, Social media, Brand', 60.00, true, 8.6, 'Built social following to 50K.'],
      ['Pierre Duval', 'pierre.d@winesommelier.com', '+1-555-1012', 'Wine Educator', 'Master of Wine (MW)', '2019-08-01', 'Wine education, WSET courses, Staff training', 90.00, true, 9.7, 'One of 400 Masters of Wine globally.'],
      ['Lisa Anderson', 'lisa.a@winesommelier.com', '+1-555-1013', 'Tasting Room Manager', 'WSET Level 3', '2021-09-15', 'Customer service, Tasting experiences', 50.00, true, 8.9, 'Creates memorable tasting experiences.'],
      ['Marcus Brown', 'marcus.b@winesommelier.com', '+1-555-1014', 'Delivery Coordinator', '', '2022-07-01', 'Logistics, Shipping, Receiving', 35.00, true, 8.2, 'Manages all incoming and outgoing shipments.'],
      ['Jennifer Wu', 'jennifer.w@winesommelier.com', '+1-555-1015', 'Finance Manager', 'CPA', '2020-01-15', 'Accounting, Pricing, P&L analysis', 70.00, true, 9.0, 'Oversees all financial operations.'],
      ['Alex Petrov', 'alex.p@winesommelier.com', '+1-555-1016', 'Bar Manager', 'Certified Mixologist', '2023-03-01', 'Cocktails, Spirits service, Bar operations', 50.00, true, 8.4, 'Expert mixologist. Designed cocktail program.']
    ];
    for (const s of staff) {
      await client.query(`INSERT INTO staff (name, email, phone, role, certification, hire_date, specialization, hourly_rate, is_active, performance_rating, notes) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`, s);
    }
    console.log('Staff seeded: 16 items');

    // Seed Tasting Journal (12 entries)
    const tastingJournal = [
      ['Château Margaux 2015', null, '2025-12-15', 'Anniversary Dinner', 'La Maison Restaurant', 'Sarah, James', 'Deep garnet with violet rim, brilliant clarity', 'Blackcurrant, violet, cedar, graphite, subtle tobacco', 'Silky tannins, layers of dark fruit, minerality, perfectly balanced acidity', 'Extraordinary length, lingering cassis and spice, 60+ seconds', 9.8, true, 450.00, 'Celebratory', 'Clear evening', 'One of the best wines I have ever tasted. Perfect pairing with lamb.'],
      ['Opus One 2018', null, '2025-11-20', 'Business Dinner', 'The Wine Room', 'Michael, David', 'Dark ruby, opaque center', 'Ripe plum, blackberry, mocha, vanilla, hint of sage', 'Full-bodied, velvety texture, dark chocolate, espresso, integrated oak', 'Long finish with coffee and dark fruit notes', 9.2, true, 380.00, 'Professional', 'Mild', 'Impressive Napa blend. Clients loved it.'],
      ['Cloudy Bay Sauvignon Blanc 2023', null, '2026-01-10', 'Weekend Lunch', 'Home Garden', 'Emma', 'Pale straw with green hues', 'Passion fruit, grapefruit, fresh cut grass, gooseberry', 'Crisp, zesty, tropical fruit balanced with herbaceous notes', 'Clean, refreshing finish with lingering citrus', 8.5, true, 22.00, 'Relaxed', 'Sunny, warm', 'Perfect summer wine. Great with grilled fish.'],
      ['Dom Pérignon 2012', null, '2025-12-31', 'New Year Eve', 'Home', 'Family and friends', 'Pale gold with fine persistent bubbles', 'Brioche, white flowers, citrus zest, almond', 'Creamy mousse, Meyer lemon, honeycomb, chalky minerality', 'Endless finish, toasty notes linger beautifully', 9.5, true, 220.00, 'Celebratory', 'Cold, clear', 'Magical way to ring in the new year.'],
      ['Whispering Angel Rosé 2023', null, '2026-02-14', 'Valentine Dinner', 'Balcony', 'Partner', 'Pale Provençal pink, crystal clear', 'Strawberry, white peach, subtle floral notes', 'Light and fresh, delicate red berry fruit, crisp acidity', 'Short but pleasant finish, clean and dry', 7.8, true, 18.00, 'Romantic', 'Cool evening', 'Lovely aperitif. Easy drinking but not complex.'],
      ['Penfolds Grange 2017', null, '2026-01-25', 'Wine Club Tasting', 'Melbourne Wine Bar', 'Wine club members', 'Inky dark purple, almost black', 'Dark plum, licorice, dark chocolate, new leather, eucalyptus', 'Massive structure, concentrated dark fruit, firm tannins, integrated oak', 'Incredibly long finish, power and elegance combined', 9.6, true, 550.00, 'Educational', 'Overcast', 'Stunning wine. Needs another 5 years but already showing greatness.'],
      ['Puligny-Montrachet 2020', null, '2026-02-08', 'Dinner Party', 'Home', 'Sophie, Pierre, Lisa', 'Brilliant gold with green highlights', 'White flowers, citrus, wet stone, hazelnut', 'Precise, mineral-driven, lemon curd, subtle oak influence', 'Long mineral finish with white fruit echoes', 9.0, true, 180.00, 'Social', 'Rainy', 'Exquisite Burgundy. Paired beautifully with lobster.'],
      ['Sassicaia 2019', null, '2026-01-18', 'Italian Night', 'Trattoria Roma', 'Carlos, Isabella', 'Deep ruby with garnet edges', 'Blackcurrant, Mediterranean herbs, pencil lead, tobacco', 'Structured, elegant tannins, dark cherry, herbs, balanced acidity', 'Long finish with herbal and mineral notes', 9.1, true, 280.00, 'Social', 'Cool', 'Classic Super Tuscan. Perfect with the bistecca.'],
      ['Macallan 18 Year', null, '2026-02-20', 'After Dinner', 'Study', 'Solo', 'Rich amber with mahogany hues', 'Dried fruit, sherry, vanilla, ginger, orange peel, cinnamon', 'Full and rich, Christmas cake, dark chocolate, dried fig, oak spice', 'Very long, warming, sherry sweetness fades to dry spice', 9.3, false, 320.00, 'Relaxed', 'Snowy', 'Wonderful dram by the fireplace. Nose is incredible.'],
      ['Tignanello 2020', null, '2026-03-05', 'Midweek Treat', 'Home Kitchen', 'Partner', 'Bright ruby-red, medium depth', 'Red cherry, violet, vanilla, light earthy notes', 'Medium-full body, juicy fruit, smooth tannins, touch of spice', 'Medium-long finish, pleasant cherry aftertaste', 8.7, true, 95.00, 'Relaxed', 'Mild', 'Great everyday luxury. Pairs with everything.'],
      ['Krug Grande Cuvée', null, '2026-03-10', 'Promotion Celebration', 'Champagne Bar', 'Team', 'Deep gold, extremely fine bubbles', 'Toasted bread, hazelnut, honey, ripe apple, marzipan', 'Rich and powerful, layers of complexity, brioche, dried fruit, nutty', 'Seemingly endless finish, nutty richness lingers', 9.7, true, 250.00, 'Celebratory', 'Clear', 'The greatest Champagne experience. Worth every penny.'],
      ['Caymus Special Selection 2019', null, '2026-03-15', 'BBQ Party', 'Backyard', 'Neighbors', 'Deep purple-black, thick legs', 'Ripe blackberry, cassis, dark chocolate, toasty oak, vanilla', 'Full-bodied, lush, ripe dark fruit, soft tannins, sweet oak', 'Long and sweet, cocoa and berry notes', 8.8, true, 180.00, 'Social', 'Warm and sunny', 'Crowd pleaser. Everyone asked what we were drinking.']
    ];
    for (const t of tastingJournal) {
      await client.query(`INSERT INTO tasting_journal (wine_name, inventory_id, tasting_date, occasion, location, companions, appearance_notes, aroma_notes, taste_notes, finish_notes, personal_rating, would_buy_again, price_paid, mood, weather, notes) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)`, t);
    }
    console.log('Tasting Journal seeded: 12 entries');

    // Seed Purchase Orders (10 items)
    const purchaseOrders = [
      [null, 'Bordeaux Direct', 'PO-2026-001', 'delivered', '6x Château Margaux 2015, 12x Château Palmer 2018', 18, 8400.00, 672.00, 150.00, 9222.00, '2025-10-01', '2025-11-15', 'James Sullivan', 'paid', 'Wire Transfer', 'Annual Bordeaux allocation order'],
      [null, 'Napa Valley Wines Inc', 'PO-2026-002', 'delivered', '12x Opus One 2018, 6x Caymus Special Selection 2019', 18, 5640.00, 451.20, 120.00, 6211.20, '2025-10-15', '2025-11-01', 'David Park', 'paid', 'Net 30', 'Q4 California wine order'],
      [null, 'Champagne Imports Ltd', 'PO-2026-003', 'shipped', '8x Dom Pérignon 2012, 4x Krug Grande Cuvée', 12, 2760.00, 220.80, 200.00, 3180.80, '2026-01-05', '2026-02-15', 'James Sullivan', 'paid', 'Wire Transfer', 'New Year Champagne restock'],
      [null, 'Italian Wine Merchants', 'PO-2026-004', 'delivered', '10x Sassicaia 2019, 8x Tignanello 2020, 3x Barolo Monfortino 2016', 21, 4800.00, 384.00, 180.00, 5364.00, '2025-11-10', '2025-12-20', 'Isabella Rossi', 'paid', 'Net 60', 'Italian collection expansion'],
      [null, 'Spirits International', 'PO-2026-005', 'delivered', '3x Macallan 18, 2x Yamazaki 12, 5x Clase Azul Reposado', 10, 2210.00, 176.80, 90.00, 2476.80, '2025-12-01', '2025-12-15', 'Akiko Tanaka', 'paid', 'Credit Card', 'Premium spirits restock'],
      [null, 'Burgundy Selections', 'PO-2026-006', 'approved', '6x Puligny-Montrachet 2021, 6x Meursault 2020', 12, 2160.00, 172.80, 160.00, 2492.80, '2026-02-20', '2026-04-01', 'Sophie Laurent', 'unpaid', 'Net 30', 'Spring white Burgundy allocation'],
      [null, 'Southern Hemisphere Wines', 'PO-2026-007', 'shipped', '4x Penfolds Grange 2018, 24x Cloudy Bay SB 2024', 28, 2728.00, 218.24, 250.00, 3196.24, '2026-02-01', '2026-03-25', 'David Park', 'partial', 'Wire Transfer', 'Australian and NZ order'],
      [null, 'Provence Rosé Direct', 'PO-2026-008', 'submitted', '48x Whispering Angel 2024, 12x Miraval Rosé 2024', 60, 1320.00, 105.60, 180.00, 1605.60, '2026-03-01', '2026-04-15', 'James Sullivan', 'unpaid', 'Net 30', 'Summer rosé pre-order'],
      [null, 'Spanish Wine Estates', 'PO-2026-009', 'draft', '4x Vega Sicilia Único 2013, 6x Pingus 2019', 10, 3880.00, 310.40, 140.00, 4330.40, '2026-03-15', '2026-05-01', '', 'unpaid', '', 'Spanish fine wine allocation - pending approval'],
      [null, 'Premium Spirits Co', 'PO-2026-010', 'approved', '6x Hennessy XO, 2x Louis XIII, 4x Hibiki 21', 12, 5280.00, 422.40, 100.00, 5802.40, '2026-03-10', '2026-04-20', 'Akiko Tanaka', 'unpaid', 'Wire Transfer', 'Luxury spirits for VIP clients']
    ];
    for (const po of purchaseOrders) {
      await client.query(`INSERT INTO purchase_orders (supplier_id, supplier_name, order_number, status, items_description, total_bottles, subtotal, tax, shipping_cost, total_amount, order_date, expected_delivery, approved_by, payment_status, payment_method, notes) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)`, po);
    }
    console.log('Purchase Orders seeded: 10 items');

    // Seed Expenses (14 items)
    const expenses = [
      ['Storage', 'Monthly cellar climate control system', 850.00, '2026-01-01', 'CellarTech Solutions', 'Wire Transfer', 'REC-2026-001', true, 'Monthly', 'Facilities', 'Jennifer Wu', 'approved', 'Includes maintenance contract'],
      ['Insurance', 'Annual wine collection insurance premium', 4200.00, '2026-01-15', 'Vintner Insurance Group', 'Wire Transfer', 'REC-2026-002', true, 'Annually', 'Insurance', 'Jennifer Wu', 'approved', 'Coverage up to $500K collection value'],
      ['Equipment', 'New wine refrigerator unit - Zone C expansion', 3500.00, '2026-01-20', 'EuroCave USA', 'Credit Card', 'REC-2026-003', false, '', 'Capital', 'Thomas Weber', 'approved', 'Multi-zone unit, 200 bottle capacity'],
      ['Utilities', 'Q1 electricity for cellar cooling systems', 620.00, '2026-03-01', 'City Power Co', 'Debit Card', 'REC-2026-004', true, 'Quarterly', 'Utilities', 'Jennifer Wu', 'approved', 'Higher than usual due to heat wave'],
      ['Marketing', 'Wine club membership brochure printing', 450.00, '2026-02-10', 'PrintPro Graphics', 'Credit Card', 'REC-2026-005', false, '', 'Marketing', 'Rachel Green', 'approved', '500 premium brochures'],
      ['Staff', 'WSET Level 3 course for Robert Kim', 1200.00, '2026-02-15', 'Wine & Spirit Education Trust', 'Credit Card', 'REC-2026-006', false, '', 'Training', 'James Sullivan', 'approved', 'Professional development investment'],
      ['Travel', 'Bordeaux En Primeur trip - flights and hotel', 2800.00, '2026-03-05', 'Travel Agency', 'Credit Card', 'REC-2026-007', false, '', 'Travel', 'James Sullivan', 'pending', '5 days in Bordeaux for barrel tastings'],
      ['Tasting Supplies', 'Riedel Sommelier Series glasses (24 set)', 780.00, '2026-01-25', 'Riedel USA', 'Credit Card', 'REC-2026-008', false, '', 'Supplies', 'Lisa Anderson', 'approved', 'Replacement for broken glasses from events'],
      ['Software', 'Annual POS system subscription', 1800.00, '2026-01-01', 'WinePOS Pro', 'Wire Transfer', 'REC-2026-009', true, 'Annually', 'Technology', 'Jennifer Wu', 'approved', 'Includes inventory integration module'],
      ['Maintenance', 'Cellar humidity system repair', 450.00, '2026-02-28', 'CellarTech Solutions', 'Check', 'REC-2026-010', false, '', 'Facilities', 'Thomas Weber', 'approved', 'Replaced faulty sensor in Zone B'],
      ['Storage', 'Wine rack installation - new section A5', 1600.00, '2026-02-05', 'Custom Wine Cellars Inc', 'Wire Transfer', 'REC-2026-011', false, '', 'Capital', 'Thomas Weber', 'approved', '120-bottle capacity mahogany racks'],
      ['Marketing', 'Instagram and Facebook ad campaign - Spring', 800.00, '2026-03-01', 'Digital Wine Marketing', 'Credit Card', 'REC-2026-012', true, 'Monthly', 'Marketing', 'Rachel Green', 'approved', 'Targeted wine enthusiast demographics'],
      ['Tasting Supplies', 'Spittoons, decanters, and aerators', 320.00, '2026-03-10', 'Wine Accessories Direct', 'Credit Card', 'REC-2026-013', false, '', 'Supplies', 'Emma Thompson', 'pending', 'For upcoming spring tasting events'],
      ['Insurance', 'Liability insurance for tasting events', 1500.00, '2026-01-10', 'EventSafe Insurance', 'Wire Transfer', 'REC-2026-014', true, 'Annually', 'Insurance', 'Jennifer Wu', 'approved', 'Covers up to 200 attendees per event']
    ];
    for (const e of expenses) {
      await client.query(`INSERT INTO expenses (category, description, amount, expense_date, vendor, payment_method, receipt_number, is_recurring, recurrence_period, budget_category, approved_by, status, notes) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)`, e);
    }
    console.log('Expenses seeded: 14 items');

    // Seed Inventory Audits (8 items)
    const audits = [
      ['2026-01-15', 'Thomas Weber', 'Cellar A - Red Wines', 42, 2, 1, 1, 0, -450.00, 'completed', 'One bottle of Vega Sicilia unaccounted for. One extra Tignanello found in wrong rack.', 'Relocated Tignanello to correct position. Investigating missing Vega Sicilia - checking sales records.', 'Overall good condition. Cellar A humidity stable.'],
      ['2026-01-15', 'Thomas Weber', 'Cellar B - Mixed', 30, 0, 0, 0, 0, 0.00, 'completed', 'All bottles accounted for. Labels in good condition.', 'No action needed.', 'Cellar B in excellent order.'],
      ['2026-01-16', 'Sophie Laurent', 'Cellar C - Whites & Rosé', 69, 1, 0, 0, 1, -18.00, 'completed', 'One Whispering Angel bottle found with damaged cork - slight seepage.', 'Damaged bottle removed from inventory. Consumed for staff training tasting.', 'Need to check cork quality on remaining Whispering Angel stock.'],
      ['2026-01-16', 'Akiko Tanaka', 'Spirit Cabinet', 16, 0, 0, 0, 0, 0.00, 'completed', 'All spirits accounted for. Seal integrity verified on all bottles.', 'No action needed.', 'Spirit cabinet in perfect order. Temperature stable at 18C.'],
      ['2026-02-15', 'Thomas Weber', 'Cellar A - Red Wines', 41, 1, 1, 0, 0, -580.00, 'completed', 'Vega Sicilia from Jan audit still unresolved. Confirmed missing after full recount.', 'Filed insurance claim for missing bottle. Updated security camera coverage for Cellar A.', 'Installed additional security camera. Missing bottle value: $580.'],
      ['2026-02-15', 'Thomas Weber', 'Cellar B - Mixed', 30, 0, 0, 0, 0, 0.00, 'completed', 'Perfect inventory. All drink windows verified.', 'Updated drink window alerts for 3 bottles approaching optimal period.', 'Champagne section perfectly maintained.'],
      ['2026-03-15', 'Thomas Weber', 'Full Cellar - Q1 Complete', 156, 3, 1, 1, 1, -1048.00, 'reviewed', 'Q1 summary: 1 confirmed missing (Vega Sicilia), 1 damaged (Whispering Angel), 1 misplaced (Tignanello - resolved). Overall shrinkage 0.6%.', 'Insurance claim filed. Security upgraded. Staff reminded of handling procedures.', 'Q1 audit complete. Shrinkage within acceptable range. Next full audit scheduled April 15.'],
      ['2026-03-20', 'Sophie Laurent', 'Cellar C - Whites & Rosé', 68, 0, 0, 0, 0, 0.00, 'in_progress', 'Audit in progress. Preliminary count looks good.', '', 'Spring audit of white wine section.']
    ];
    for (const a of audits) {
      await client.query(`INSERT INTO inventory_audits (audit_date, auditor_name, zone_location, total_items_checked, discrepancies_found, missing_bottles, extra_bottles, damaged_bottles, total_value_variance, status, findings, corrective_actions, notes) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)`, a);
    }
    console.log('Inventory Audits seeded: 8 items');

    // Seed Wine Labels (10 items)
    const wineLabels = [
      [null, 'Château Margaux 2015', 'Château Margaux', 2015, 'Margaux, Bordeaux', 'France', '', '', '', 'Classic Bordeaux label design. Gold lettering on cream background. Château illustration at top.', 'excellent', true, 'bordeaux,first-growth,classic,iconic', 'One of the most elegant label designs in Bordeaux.'],
      [null, 'Opus One 2018', 'Opus One Winery', 2018, 'Napa Valley', 'USA', '', '', '', 'Minimalist silhouette design of Mondavi and Rothschild profiles. Embossed gold on dark label.', 'excellent', true, 'napa,minimalist,iconic,gold-embossed', 'The dual profile silhouette is instantly recognizable.'],
      [null, 'Sassicaia 2019', 'Tenuta San Guido', 2019, 'Bolgheri', 'Italy', '', '', '', 'Compass star design with blue and gold. Simple yet distinctive Italian elegance.', 'excellent', true, 'super-tuscan,italian,star-design,classic', 'The compass star has become synonymous with Italian fine wine.'],
      [null, 'Penfolds Grange 2017', 'Penfolds', 2017, 'South Australia', 'Australia', '', '', '', 'Bold red and black design. Distinctive Penfolds crest. Premium metallic printing.', 'excellent', false, 'australian,shiraz,bold,premium', 'Strong branding. The Penfolds crest conveys heritage.'],
      [null, 'Dom Pérignon 2012', 'Moët & Chandon', 2012, 'Champagne', 'France', '', '', '', 'Shield-shaped label with Dom Pérignon script. Dark green on cream. Vintage year prominent.', 'excellent', true, 'champagne,prestige,shield,vintage', 'Timeless design unchanged for decades.'],
      [null, 'Cloudy Bay Sauvignon Blanc 2023', 'Cloudy Bay', 2023, 'Marlborough', 'New Zealand', '', '', '', 'Painterly landscape of Cloudy Bay. Soft watercolor style. Light and airy feel.', 'good', false, 'new-zealand,landscape,watercolor,modern', 'The watercolor landscape perfectly captures Marlborough spirit.'],
      [null, 'Krug Grande Cuvée', 'Krug', null, 'Champagne', 'France', '', '', '', 'Small rectangular label with Krug coat of arms. Gold text on cream. Edition number on each bottle.', 'excellent', true, 'champagne,luxury,coat-of-arms,numbered', 'Each bottle has unique edition ID. Understated luxury.'],
      [null, 'Vega Sicilia Único 2012', 'Vega Sicilia', 2012, 'Ribera del Duero', 'Spain', '', '', '', 'Red and gold coat of arms. Ornate border design. Heavyweight embossed paper.', 'excellent', true, 'spanish,coat-of-arms,ornate,embossed', 'Among the most prestigious label designs in Spain.'],
      [null, 'Barolo Monfortino 2016', 'Giacomo Conterno', 2016, 'Barolo, Piedmont', 'Italy', '', '', '', 'Traditional Italian label with winery name in serif font. Simple cream and red design.', 'good', false, 'barolo,traditional,italian,simple', 'Understated design lets the wine reputation speak.'],
      [null, 'Whispering Angel Rosé 2023', 'Château d\'Esclans', 2023, 'Provence', 'France', '', '', '', 'Ethereal angel wing design. Soft pink tones. Modern and elegant typography.', 'excellent', false, 'provence,rose,angel,modern,elegant', 'The angel wing design made this bottle Instagram-famous.']
    ];
    for (const wl of wineLabels) {
      await client.query(`INSERT INTO wine_labels (inventory_id, wine_name, producer, vintage, region, country, label_image_url, back_label_url, bottle_photo_url, design_notes, label_condition, is_favorite, tags, notes) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)`, wl);
    }
    console.log('Wine Labels seeded: 10 items');

    // Seed Cellar Zones (8 items)
    const cellarZones = [
      ['Cellar A - Premium Reds', 'A', 'Red Wine', 120, 47, 14.0, 70.0, 'LED Dim', 'Wood', 'Basement', true, '2026-03-15', 'Primary red wine storage. Houses First Growth Bordeaux and premium Napa wines.'],
      ['Cellar A - Reserve Section', 'A-RES', 'Reserve', 30, 7, 13.5, 72.0, 'None', 'Custom Built', 'Basement', true, '2026-03-15', 'Investment-grade wines. Limited access. Climate controlled independently.'],
      ['Cellar B - Mixed Collection', 'B', 'Mixed', 100, 30, 13.0, 68.0, 'LED Dim', 'Metal', 'Basement', true, '2026-03-15', 'Super Tuscans, Champagne, and mid-range reds.'],
      ['Cellar C - Whites & Rosé', 'C', 'White Wine', 150, 69, 10.0, 65.0, 'LED Dim', 'Metal', 'Basement', true, '2026-03-20', 'White wines, rosé, and dessert wines. Lower temperature zone.'],
      ['Spirit Cabinet - Main', 'S1', 'Spirits', 50, 16, 18.0, 55.0, 'LED Standard', 'Wood', 'Ground', true, '2026-01-16', 'Premium spirits: Cognac, Scotch, Japanese whisky.'],
      ['Spirit Cabinet - Secondary', 'S2', 'Spirits', 40, 7, 18.0, 55.0, 'LED Standard', 'Wood', 'Ground', true, '2026-01-16', 'Tequila, additional whisky, bar spirits.'],
      ['Overflow Storage', 'OV', 'Overflow', 200, 0, 15.0, 65.0, 'Fluorescent', 'Modular', 'Ground', true, '2026-02-01', 'Temporary storage for large deliveries before sorting.'],
      ['Sparkling Wine Vault', 'SP', 'Sparkling', 60, 12, 8.0, 75.0, 'None', 'Stone', 'Underground', true, '2026-03-10', 'Dedicated sparkling wine storage. Coldest zone. Vibration-free.']
    ];
    for (const cz of cellarZones) {
      await client.query(`INSERT INTO cellar_zones (zone_name, zone_code, zone_type, total_capacity, current_count, target_temp, target_humidity, lighting, rack_type, floor_level, is_active, last_inspected, notes) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)`, cz);
    }
    console.log('Cellar Zones seeded: 8 items');

    // Seed Consumption Log (12 items)
    const consumptionLog = [
      [null, 'Whispering Angel Rosé 2023', '2026-01-05', 2, 'Dinner Party', 'Grilled seafood platter, Mediterranean salad', 'Friends - 6 guests', 'Chilled (6-8C)', false, '', 8.0, 24.00, 'Screw Cap', 'Perfect summer opener. Everyone loved it.'],
      [null, 'Cloudy Bay Sauvignon Blanc 2023', '2026-01-12', 1, 'Casual Dinner', 'Pan-seared halibut with lemon butter', 'Partner', 'Chilled (6-8C)', false, '', 8.5, 28.00, 'Screw Cap', 'Crisp and refreshing. Great midweek wine.'],
      [null, 'Tignanello 2020', '2026-01-20', 1, 'Casual Dinner', 'Homemade pasta with wild boar ragu', 'Family', 'Cellar Temp (13-15C)', true, '30 minutes', 8.8, 120.00, 'Corkscrew', 'Decanting really opened it up. Lovely with the ragu.'],
      [null, 'Château Margaux 2015', '2026-01-28', 1, 'Celebration', 'Rack of lamb, truffle mashed potatoes', 'Close friends - 4 guests', 'Room Temp (16-18C)', true, '2 hours', 9.8, 890.00, 'Ah-So', 'Birthday celebration. Absolutely magnificent wine. 2 hour decant was perfect.'],
      [null, 'Dom Pérignon 2012', '2026-02-14', 1, 'Celebration', 'Oysters, caviar, smoked salmon blinis', 'Partner', 'Chilled (6-8C)', false, '', 9.5, 310.00, 'Waiter Knife', 'Valentine evening. Incredible bubbles and complexity.'],
      [null, 'Caymus Special Selection 2019', '2026-02-22', 1, 'Dinner Party', 'BBQ ribs, smoked brisket, cornbread', 'Neighbors - 8 guests', 'Room Temp (16-18C)', true, '1 hour', 8.9, 210.00, 'Corkscrew', 'Big bold Napa Cab was perfect for BBQ night.'],
      [null, 'Puligny-Montrachet 2020', '2026-03-01', 1, 'Business Dinner', 'Butter-poached lobster, risotto', 'Clients - 3 guests', 'Cool (10-12C)', false, '', 9.1, 220.00, 'Waiter Knife', 'Impressive white Burgundy. Clients were very pleased.'],
      [null, 'Macallan 18 Year', '2026-03-05', 1, 'Personal Enjoyment', 'Dark chocolate truffles', 'Solo', 'Room Temp (16-18C)', false, '', 9.3, 410.00, 'Corkscrew', 'Quiet evening by the fire. Exceptional dram.'],
      [null, 'Krug Grande Cuvée', '2026-03-08', 1, 'Celebration', 'Seared scallops, white truffle', 'Team celebration - 6', 'Chilled (6-8C)', false, '', 9.7, 290.00, 'Waiter Knife', 'Team promotion celebration. Krug never disappoints.'],
      [null, 'Opus One 2018', '2026-03-12', 1, 'Business Dinner', 'Wagyu beef tenderloin, roasted vegetables', 'Business partners - 4', 'Room Temp (16-18C)', true, '1 hour', 9.2, 420.00, 'Corkscrew', 'Client dinner at home. Opus One always impresses.'],
      [null, 'Sassicaia 2019', '2026-03-15', 1, 'Wine Club', 'Italian cheese board, prosciutto', 'Wine club - 12 members', 'Cellar Temp (13-15C)', true, '30 minutes', 9.0, 320.00, 'Corkscrew', 'Wine club Super Tuscan tasting theme night.'],
      [null, 'Whispering Angel Rosé 2023', '2026-03-18', 3, 'Tasting Event', 'Assorted canapés', 'Spring tasting guests - 20', 'Chilled (6-8C)', false, '', 7.8, 24.00, 'Screw Cap', 'Spring tasting event aperitif. High volume consumption.']
    ];
    for (const cl of consumptionLog) {
      await client.query(`INSERT INTO consumption_log (inventory_id, wine_name, consumed_date, quantity, occasion, served_with, served_to, serving_temp, decanted, decant_time, personal_rating, value_at_consumption, open_method, notes) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)`, cl);
    }
    console.log('Consumption Log seeded: 12 items');

    // Seed Wine Clubs (10 items)
    const wineClubs = [
      ['Sommelier Select Club', 'Victoria Harrington', 'v.harrington@email.com', '+1-555-2001', 'Platinum', 6, 'Monthly', 450.00, 'Bordeaux, Burgundy, investment-grade wines only', '2024-06-01', '2026-06-01', true, 22, 9900.00, 'Founding member. Prefers only premier cru and above.'],
      ['Sommelier Select Club', 'Richard Albright', 'r.albright@email.com', '+1-555-2002', 'Gold', 4, 'Monthly', 280.00, 'Bold reds, Napa Valley, Italian wines', '2024-09-01', '2026-09-01', true, 18, 5040.00, 'Restaurant owner. Uses selections for his wine list.'],
      ['Sommelier Select Club', 'Diana Chen', 'd.chen@email.com', '+1-555-2003', 'Gold', 4, 'Monthly', 280.00, 'Organic and biodynamic wines, diverse regions', '2025-01-01', '2027-01-01', true, 14, 3920.00, 'Very interested in sustainable wine production.'],
      ['Sommelier Select Club', 'James Patterson', 'j.patterson@email.com', '+1-555-2004', 'Silver', 3, 'Bi-Monthly', 180.00, 'White wines, Champagne, light reds', '2025-03-01', '2027-03-01', true, 6, 1080.00, 'Prefers lighter styles. No heavy oaked wines.'],
      ['Sommelier Select Club', 'Sarah Mitchell', 's.mitchell@email.com', '+1-555-2005', 'Standard', 2, 'Monthly', 120.00, 'No preference - loves surprises and discovery', '2025-06-01', '2026-06-01', true, 9, 1080.00, 'New wine enthusiast. Appreciates tasting notes with each shipment.'],
      ['Discovery Wine Club', 'Michael Torres', 'm.torres@email.com', '+1-555-2006', 'Platinum', 6, 'Quarterly', 600.00, 'Rare wines, limited productions, library vintages', '2024-03-01', '2026-03-01', true, 8, 4800.00, 'Collector. Wants wines not available in retail.'],
      ['Discovery Wine Club', 'Emily Fontaine', 'e.fontaine@email.com', '+1-555-2007', 'Gold', 4, 'Quarterly', 350.00, 'French wines only - Bordeaux, Rhône, Loire', '2025-01-01', '2027-01-01', true, 4, 1400.00, 'French expat. Misses wines from home.'],
      ['Discovery Wine Club', 'Robert Nakamura', 'r.nakamura@email.com', '+1-555-2008', 'Silver', 2, 'Quarterly', 200.00, 'Japanese whisky and sake when available, otherwise red wines', '2025-06-01', '2026-06-01', true, 2, 400.00, 'Also interested in spirits club if we start one.'],
      ['Sommelier Select Club', 'Alexandra Kozlov', 'a.kozlov@email.com', '+1-555-2009', 'Founders', 6, 'Monthly', 500.00, 'Investment-grade only. Bordeaux, Burgundy, Super Tuscan', '2024-01-01', '2026-01-01', true, 26, 13000.00, 'Founding member #1. Wine investor. Expects exceptional curation.'],
      ['Discovery Wine Club', 'Thomas Bradford', 't.bradford@email.com', '+1-555-2010', 'Standard', 2, 'Bi-Monthly', 90.00, 'Easy-drinking reds, nothing too tannic', '2025-09-01', '2026-09-01', false, 3, 270.00, 'Paused membership - traveling abroad until September.']
    ];
    for (const wc of wineClubs) {
      await client.query(`INSERT INTO wine_clubs (club_name, member_name, member_email, member_phone, membership_tier, bottles_per_shipment, shipment_frequency, price_per_shipment, preferences, start_date, renewal_date, is_active, total_shipments, lifetime_value, notes) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)`, wc);
    }
    console.log('Wine Clubs seeded: 10 items');

    // Seed Reservations (12 items)
    const reservations = [
      ['Victoria Harrington', 'v.harrington@email.com', '+1-555-2001', 4, '2026-03-25', '7:00 PM', 'Private Dinner', 120, 'Private Cellar', 'Château Margaux 2015, Dom Pérignon 2012', 'Candles, flower arrangement, cheese course to start', 'confirmed', 200.00, true, 'VIP member. Birthday dinner for her husband.'],
      ['Richard Albright', 'r.albright@email.com', '+1-555-2002', 8, '2026-03-28', '6:30 PM', 'Wine Pairing', 150, 'Main Dining', 'Full Italian wine flight - Sassicaia, Tignanello, Barolo', 'Need vegetarian options for 2 guests', 'confirmed', 150.00, true, 'Restaurant industry dinner. Potential wholesale partnership.'],
      ['Corporate Group - Nexus Tech', 'events@nexustech.com', '+1-555-3001', 20, '2026-04-02', '5:00 PM', 'Corporate Event', 180, 'Barrel Room', 'Mixed selection - reds and whites, nothing too expensive', 'AV setup needed for brief presentation. Canapés style service.', 'confirmed', 500.00, true, 'Team building event. Budget: $100/person all-in.'],
      ['Diana Chen', 'd.chen@email.com', '+1-555-2003', 2, '2026-04-05', '2:00 PM', 'Tasting', 60, 'Tasting Room', 'Organic and biodynamic wines showcase', '', 'confirmed', 0.00, false, 'Wine club member. Interested in sustainable wines educational tasting.'],
      ['James & Linda Patterson', 'j.patterson@email.com', '+1-555-2004', 2, '2026-04-10', '7:30 PM', 'Anniversary', 120, 'VIP Lounge', 'Krug Grande Cuvée, Puligny-Montrachet', 'Anniversary cake allowed? Quiet corner preferred.', 'confirmed', 100.00, true, 'Wedding anniversary. 25 years.'],
      ['Wine Education Group', 'info@wineeducation.org', '+1-555-3002', 15, '2026-04-12', '10:00 AM', 'Wine Education', 120, 'Barrel Room', 'WSET Level 2 practice wines', 'Tasting mats, scoring sheets, spit buckets for each student', 'confirmed', 300.00, true, 'Monthly WSET practice session hosted by Pierre Duval.'],
      ['Michael Torres', 'm.torres@email.com', '+1-555-2006', 6, '2026-04-15', '6:00 PM', 'Cellar Tour', 90, 'Private Cellar', 'Investment-grade wines tour with tasting of 4 vintages', 'Guest is bringing 2 bottles from personal collection to share', 'pending', 250.00, false, 'Collector wanting to evaluate our reserve wines for purchase.'],
      ['Sarah Mitchell', 's.mitchell@email.com', '+1-555-2005', 4, '2026-04-18', '3:00 PM', 'Tasting', 60, 'Garden Terrace', 'Spring rosé and white wine selection', 'Outdoor seating preferred. Light snacks.', 'confirmed', 0.00, false, 'Casual tasting with friends. New club member.'],
      ['Birthday Party - Alvarez', 'maria.alvarez@email.com', '+1-555-3003', 12, '2026-04-20', '7:00 PM', 'Birthday', 180, 'Rooftop', 'Champagne service, followed by red wine with dinner', 'Surprise party! Guest of honor arriving at 7:30. Decorations needed.', 'confirmed', 350.00, true, '40th birthday celebration. Full dinner service.'],
      ['Emily Fontaine', 'e.fontaine@email.com', '+1-555-2007', 2, '2026-04-22', '12:00 PM', 'Wine Pairing', 90, 'Main Dining', 'French wines only - to match French lunch menu', 'Vegetarian French cuisine pairing', 'pending', 0.00, false, 'Lunch pairing. Wine club member.'],
      ['Corporate Group - Atlas Finance', 'admin@atlasfinance.com', '+1-555-3004', 30, '2026-04-28', '4:00 PM', 'Corporate Event', 180, 'Barrel Room', 'Premium selection - client entertainment budget', 'Full bar setup, passed hors doeuvres, sommelier presentation', 'pending', 800.00, false, 'Large corporate event. Need 2 sommeliers on duty.'],
      ['Alexandra Kozlov', 'a.kozlov@email.com', '+1-555-2009', 6, '2026-05-01', '7:00 PM', 'Private Dinner', 150, 'Private Cellar', 'Vega Sicilia Único, Barolo Monfortino, Château Margaux', 'White truffle menu. No expense spared.', 'confirmed', 500.00, true, 'Founders club exclusive dinner. Top-tier wines only.']
    ];
    for (const r of reservations) {
      await client.query(`INSERT INTO reservations (guest_name, guest_email, guest_phone, party_size, reservation_date, reservation_time, event_type, duration_minutes, room_location, wines_requested, special_requests, status, deposit_amount, deposit_paid, notes) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)`, r);
    }
    console.log('Reservations seeded: 12 items');

    // Seed Maintenance Log (10 items)
    const maintenanceLog = [
      ['Climate Control Unit - Cellar A', 'Preventive', 'Cellar A', 'CellarTech Solutions', '2026-01-10', '2026-04-10', 350.00, 'CellarTech Solutions', 'medium', 'completed', 'Quarterly preventive maintenance. Cleaned filters, calibrated sensors, tested backup systems.', 'Air filter, 2x temperature sensors', 'Under Warranty', 'Unit running optimally. Warranty expires Dec 2027.'],
      ['Climate Control Unit - Cellar B', 'Preventive', 'Cellar B', 'CellarTech Solutions', '2026-01-10', '2026-04-10', 350.00, 'CellarTech Solutions', 'medium', 'completed', 'Quarterly preventive maintenance. All systems nominal.', 'Air filter', 'Under Warranty', 'Consistent performance. No issues noted.'],
      ['Climate Control Unit - Cellar C', 'Preventive', 'Cellar C', 'CellarTech Solutions', '2026-01-11', '2026-04-11', 350.00, 'CellarTech Solutions', 'medium', 'completed', 'Quarterly maintenance. Compressor running slightly louder than normal - monitoring.', 'Air filter, condensation tray', 'Under Warranty', 'Flagged compressor noise for next inspection.'],
      ['Humidity System - Cellar B', 'Corrective', 'Cellar B', 'Thomas Weber', '2026-02-28', null, 450.00, 'CellarTech Solutions', 'high', 'completed', 'Humidity sensor reporting incorrect readings. Replaced sensor and recalibrated system.', 'Humidity sensor module HS-400', 'Expired', 'Old sensor was 3 years past warranty. New sensor has 2-year warranty.'],
      ['LED Lighting System', 'Inspection', 'Cellar A', 'Thomas Weber', '2026-02-15', '2026-08-15', 0.00, '', 'low', 'completed', 'Semi-annual lighting inspection. All LED strips functioning. No UV leakage detected.', '', 'No Warranty', 'Custom LED installation. No replacement parts needed.'],
      ['Security Camera System', 'Replacement', 'Cellar A', 'SecureTech Inc', '2026-02-20', '2027-02-20', 1200.00, 'SecureTech Inc', 'high', 'completed', 'Installed 2 additional cameras after audit discrepancy. HD night vision, motion-activated recording.', '2x HD security cameras, mounting hardware, cable runs', 'Under Warranty', 'New cameras cover blind spots identified during January audit.'],
      ['Wine Rack Section A5', 'Inspection', 'Cellar A', 'Thomas Weber', '2026-03-01', '2026-09-01', 0.00, '', 'low', 'completed', 'New rack installation inspection after 30 days. All joints secure, no wood warping.', '', 'Under Warranty', 'Custom Wine Cellars Inc warranty: 5 years structural.'],
      ['Cooling Compressor - Sparkling Vault', 'Emergency', 'Sparkling Wine Vault', 'CellarTech Solutions', '2026-03-05', '2026-06-05', 890.00, 'CellarTech Solutions', 'critical', 'completed', 'Emergency call - compressor failure. Sparkling vault temp rose to 14C. Replaced compressor unit.', 'Compressor unit CX-200, refrigerant recharge', 'Under Warranty', 'Wines moved to Cellar C temporarily during repair. No damage to stock.'],
      ['POS Terminal', 'Preventive', 'Tasting Room', 'Jennifer Wu', '2026-03-10', '2026-06-10', 0.00, 'WinePOS Pro', 'low', 'completed', 'Software update and receipt printer maintenance. Cleared paper jams.', 'Receipt printer ribbon', 'Extended Warranty', 'WinePOS Pro support contract covers all maintenance.'],
      ['Climate Control Unit - Cellar A', 'Preventive', 'Cellar A', 'CellarTech Solutions', '2026-04-10', '2026-07-10', 350.00, 'CellarTech Solutions', 'medium', 'scheduled', 'Q2 quarterly preventive maintenance scheduled.', '', 'Under Warranty', 'Scheduled for April 10. Will also check Cellar C compressor noise.']
    ];
    for (const ml of maintenanceLog) {
      await client.query(`INSERT INTO maintenance_log (equipment_name, maintenance_type, zone_location, performed_by, maintenance_date, next_due_date, cost, vendor, priority, status, description, parts_replaced, warranty_status, notes) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)`, ml);
    }
    console.log('Maintenance Log seeded: 10 items');

    console.log('\n✅ All seed data inserted successfully!');
  } catch (err) {
    console.error('Seed error:', err);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

seed();
