-- Users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'admin',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Wine/Spirits Inventory (Cellar Management)
CREATE TABLE IF NOT EXISTS inventory (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(100) NOT NULL,
    category VARCHAR(100) NOT NULL,
    region VARCHAR(255),
    country VARCHAR(100),
    vintage INTEGER,
    producer VARCHAR(255),
    alcohol_pct DECIMAL(4,1),
    quantity INTEGER DEFAULT 0,
    bottle_size VARCHAR(50) DEFAULT '750ml',
    purchase_price DECIMAL(10,2),
    current_value DECIMAL(10,2),
    location VARCHAR(255),
    rack_position VARCHAR(50),
    date_added TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    drink_window_start INTEGER,
    drink_window_end INTEGER,
    notes TEXT,
    image_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tasting Notes
CREATE TABLE IF NOT EXISTS tasting_notes (
    id SERIAL PRIMARY KEY,
    inventory_id INTEGER REFERENCES inventory(id) ON DELETE CASCADE,
    wine_name VARCHAR(255) NOT NULL,
    taster_name VARCHAR(255),
    date_tasted DATE DEFAULT CURRENT_DATE,
    appearance VARCHAR(500),
    nose TEXT,
    palate TEXT,
    finish TEXT,
    overall_rating DECIMAL(3,1),
    ai_generated BOOLEAN DEFAULT FALSE,
    ai_tasting_note TEXT,
    ai_score DECIMAL(3,1),
    ai_summary TEXT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Food Pairings
CREATE TABLE IF NOT EXISTS food_pairings (
    id SERIAL PRIMARY KEY,
    inventory_id INTEGER REFERENCES inventory(id) ON DELETE CASCADE,
    wine_name VARCHAR(255) NOT NULL,
    wine_type VARCHAR(100),
    dish_name VARCHAR(255) NOT NULL,
    cuisine_type VARCHAR(100),
    pairing_score DECIMAL(3,1),
    pairing_reason TEXT,
    flavor_bridge TEXT,
    ai_generated BOOLEAN DEFAULT FALSE,
    ai_suggestions TEXT,
    ai_menu_recommendations TEXT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Price Optimization
CREATE TABLE IF NOT EXISTS price_optimization (
    id SERIAL PRIMARY KEY,
    inventory_id INTEGER REFERENCES inventory(id) ON DELETE CASCADE,
    wine_name VARCHAR(255) NOT NULL,
    current_retail_price DECIMAL(10,2),
    cost_price DECIMAL(10,2),
    suggested_price DECIMAL(10,2),
    margin_pct DECIMAL(5,2),
    market_avg_price DECIMAL(10,2),
    demand_level VARCHAR(50),
    seasonality_factor DECIMAL(4,2),
    competitor_price DECIMAL(10,2),
    price_elasticity DECIMAL(4,2),
    ai_generated BOOLEAN DEFAULT FALSE,
    ai_price_analysis TEXT,
    ai_recommendation TEXT,
    strategy VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Vintage Valuation
CREATE TABLE IF NOT EXISTS vintage_valuation (
    id SERIAL PRIMARY KEY,
    inventory_id INTEGER REFERENCES inventory(id) ON DELETE CASCADE,
    wine_name VARCHAR(255) NOT NULL,
    vintage INTEGER,
    producer VARCHAR(255),
    region VARCHAR(255),
    appellation VARCHAR(255),
    current_market_value DECIMAL(10,2),
    purchase_price DECIMAL(10,2),
    value_trend VARCHAR(50),
    critic_score_ws INTEGER,
    critic_score_rp INTEGER,
    critic_score_jd INTEGER,
    rarity_level VARCHAR(50),
    investment_grade BOOLEAN DEFAULT FALSE,
    maturity_status VARCHAR(50),
    auction_history TEXT,
    ai_generated BOOLEAN DEFAULT FALSE,
    ai_valuation_analysis TEXT,
    ai_investment_recommendation TEXT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Cellar Alerts
CREATE TABLE IF NOT EXISTS cellar_alerts (
    id SERIAL PRIMARY KEY,
    inventory_id INTEGER REFERENCES inventory(id) ON DELETE CASCADE,
    wine_name VARCHAR(255) NOT NULL,
    alert_type VARCHAR(100) NOT NULL,
    severity VARCHAR(50) DEFAULT 'medium',
    message TEXT NOT NULL,
    details TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    is_resolved BOOLEAN DEFAULT FALSE,
    triggered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sales Tracking
CREATE TABLE IF NOT EXISTS sales (
    id SERIAL PRIMARY KEY,
    inventory_id INTEGER REFERENCES inventory(id) ON DELETE SET NULL,
    wine_name VARCHAR(255) NOT NULL,
    customer_name VARCHAR(255),
    customer_type VARCHAR(100),
    quantity_sold INTEGER NOT NULL DEFAULT 1,
    unit_price DECIMAL(10,2) NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    cost_basis DECIMAL(10,2),
    profit DECIMAL(10,2),
    sale_type VARCHAR(100) DEFAULT 'retail',
    sale_date DATE DEFAULT CURRENT_DATE,
    payment_method VARCHAR(50),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Cocktail Recipes
CREATE TABLE IF NOT EXISTS cocktail_recipes (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    spirit_base VARCHAR(100) NOT NULL,
    category VARCHAR(100),
    difficulty VARCHAR(50) DEFAULT 'Medium',
    prep_time VARCHAR(50),
    ingredients TEXT NOT NULL,
    instructions TEXT NOT NULL,
    garnish VARCHAR(255),
    glassware VARCHAR(100),
    flavor_profile VARCHAR(255),
    occasion VARCHAR(255),
    ai_generated BOOLEAN DEFAULT FALSE,
    ai_recipe TEXT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Suppliers
CREATE TABLE IF NOT EXISTS suppliers (
    id SERIAL PRIMARY KEY,
    company_name VARCHAR(255) NOT NULL,
    contact_name VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(50),
    address TEXT,
    city VARCHAR(100),
    country VARCHAR(100),
    specialization VARCHAR(255),
    rating DECIMAL(3,1),
    payment_terms VARCHAR(100),
    minimum_order DECIMAL(10,2),
    lead_time_days INTEGER,
    is_active BOOLEAN DEFAULT TRUE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Wine Events / Journal
CREATE TABLE IF NOT EXISTS wine_events (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    event_type VARCHAR(100) NOT NULL,
    event_date DATE NOT NULL,
    location VARCHAR(255),
    description TEXT,
    wines_featured TEXT,
    attendees INTEGER,
    cost DECIMAL(10,2),
    revenue DECIMAL(10,2),
    rating DECIMAL(3,1),
    highlights TEXT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Customers
CREATE TABLE IF NOT EXISTS customers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    customer_type VARCHAR(100),
    company VARCHAR(255),
    preferences TEXT,
    favorite_regions VARCHAR(500),
    favorite_varietals VARCHAR(500),
    budget_range VARCHAR(100),
    total_purchases DECIMAL(10,2) DEFAULT 0,
    visit_count INTEGER DEFAULT 0,
    last_visit DATE,
    vip_status BOOLEAN DEFAULT FALSE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Wishlist
CREATE TABLE IF NOT EXISTS wishlist (
    id SERIAL PRIMARY KEY,
    wine_name VARCHAR(255) NOT NULL,
    producer VARCHAR(255),
    vintage INTEGER,
    region VARCHAR(255),
    country VARCHAR(100),
    estimated_price DECIMAL(10,2),
    priority VARCHAR(50) DEFAULT 'medium',
    reason TEXT,
    source VARCHAR(255),
    target_quantity INTEGER DEFAULT 1,
    status VARCHAR(50) DEFAULT 'searching',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Temperature Log
CREATE TABLE IF NOT EXISTS temperature_log (
    id SERIAL PRIMARY KEY,
    zone_name VARCHAR(255) NOT NULL,
    temperature DECIMAL(4,1) NOT NULL,
    humidity DECIMAL(4,1),
    target_temp DECIMAL(4,1),
    target_humidity DECIMAL(4,1),
    status VARCHAR(50) DEFAULT 'normal',
    reading_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Deliveries
CREATE TABLE IF NOT EXISTS deliveries (
    id SERIAL PRIMARY KEY,
    supplier_id INTEGER REFERENCES suppliers(id) ON DELETE SET NULL,
    supplier_name VARCHAR(255) NOT NULL,
    order_number VARCHAR(100),
    status VARCHAR(50) DEFAULT 'pending',
    items_description TEXT,
    total_bottles INTEGER,
    total_cost DECIMAL(10,2),
    order_date DATE,
    expected_date DATE,
    delivered_date DATE,
    tracking_number VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Staff
CREATE TABLE IF NOT EXISTS staff (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    role VARCHAR(100) NOT NULL,
    certification VARCHAR(255),
    hire_date DATE,
    specialization VARCHAR(255),
    hourly_rate DECIMAL(8,2),
    is_active BOOLEAN DEFAULT TRUE,
    performance_rating DECIMAL(3,1),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tasting Journal (Personal Diary)
CREATE TABLE IF NOT EXISTS tasting_journal (
    id SERIAL PRIMARY KEY,
    inventory_id INTEGER REFERENCES inventory(id) ON DELETE SET NULL,
    wine_name VARCHAR(255) NOT NULL,
    tasting_date DATE DEFAULT CURRENT_DATE,
    occasion VARCHAR(255),
    location VARCHAR(255),
    companions VARCHAR(500),
    appearance_notes TEXT,
    aroma_notes TEXT,
    taste_notes TEXT,
    finish_notes TEXT,
    personal_rating DECIMAL(3,1),
    would_buy_again BOOLEAN DEFAULT FALSE,
    price_paid DECIMAL(10,2),
    mood VARCHAR(100),
    weather VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Purchase Orders
CREATE TABLE IF NOT EXISTS purchase_orders (
    id SERIAL PRIMARY KEY,
    supplier_id INTEGER REFERENCES suppliers(id) ON DELETE SET NULL,
    supplier_name VARCHAR(255) NOT NULL,
    order_number VARCHAR(100),
    status VARCHAR(50) DEFAULT 'draft',
    items_description TEXT NOT NULL,
    total_bottles INTEGER DEFAULT 0,
    subtotal DECIMAL(10,2),
    tax DECIMAL(10,2) DEFAULT 0,
    shipping_cost DECIMAL(10,2) DEFAULT 0,
    total_amount DECIMAL(10,2),
    order_date DATE DEFAULT CURRENT_DATE,
    expected_delivery DATE,
    approved_by VARCHAR(255),
    payment_status VARCHAR(50) DEFAULT 'unpaid',
    payment_method VARCHAR(50),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Expenses
CREATE TABLE IF NOT EXISTS expenses (
    id SERIAL PRIMARY KEY,
    category VARCHAR(100) NOT NULL,
    description VARCHAR(500) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    expense_date DATE DEFAULT CURRENT_DATE,
    vendor VARCHAR(255),
    payment_method VARCHAR(50),
    receipt_number VARCHAR(100),
    is_recurring BOOLEAN DEFAULT FALSE,
    recurrence_period VARCHAR(50),
    budget_category VARCHAR(100),
    approved_by VARCHAR(255),
    status VARCHAR(50) DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Inventory Audits
CREATE TABLE IF NOT EXISTS inventory_audits (
    id SERIAL PRIMARY KEY,
    audit_date DATE DEFAULT CURRENT_DATE,
    auditor_name VARCHAR(255) NOT NULL,
    zone_location VARCHAR(255),
    total_items_checked INTEGER DEFAULT 0,
    discrepancies_found INTEGER DEFAULT 0,
    missing_bottles INTEGER DEFAULT 0,
    extra_bottles INTEGER DEFAULT 0,
    damaged_bottles INTEGER DEFAULT 0,
    total_value_variance DECIMAL(10,2) DEFAULT 0,
    status VARCHAR(50) DEFAULT 'in_progress',
    findings TEXT,
    corrective_actions TEXT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Wine Labels (Collection Gallery)
CREATE TABLE IF NOT EXISTS wine_labels (
    id SERIAL PRIMARY KEY,
    inventory_id INTEGER REFERENCES inventory(id) ON DELETE SET NULL,
    wine_name VARCHAR(255) NOT NULL,
    producer VARCHAR(255),
    vintage INTEGER,
    region VARCHAR(255),
    country VARCHAR(100),
    label_image_url VARCHAR(500),
    back_label_url VARCHAR(500),
    bottle_photo_url VARCHAR(500),
    design_notes TEXT,
    label_condition VARCHAR(50) DEFAULT 'excellent',
    is_favorite BOOLEAN DEFAULT FALSE,
    tags VARCHAR(500),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Cellar Zones
CREATE TABLE IF NOT EXISTS cellar_zones (
    id SERIAL PRIMARY KEY,
    zone_name VARCHAR(255) NOT NULL,
    zone_code VARCHAR(50),
    zone_type VARCHAR(100) NOT NULL,
    total_capacity INTEGER DEFAULT 0,
    current_count INTEGER DEFAULT 0,
    target_temp DECIMAL(4,1),
    target_humidity DECIMAL(4,1),
    lighting VARCHAR(100),
    rack_type VARCHAR(100),
    floor_level VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    last_inspected DATE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Consumption Log
CREATE TABLE IF NOT EXISTS consumption_log (
    id SERIAL PRIMARY KEY,
    inventory_id INTEGER REFERENCES inventory(id) ON DELETE SET NULL,
    wine_name VARCHAR(255) NOT NULL,
    consumed_date DATE DEFAULT CURRENT_DATE,
    quantity INTEGER DEFAULT 1,
    occasion VARCHAR(255),
    served_with VARCHAR(500),
    served_to VARCHAR(500),
    serving_temp VARCHAR(50),
    decanted BOOLEAN DEFAULT FALSE,
    decant_time VARCHAR(50),
    personal_rating DECIMAL(3,1),
    value_at_consumption DECIMAL(10,2),
    open_method VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Wine Clubs
CREATE TABLE IF NOT EXISTS wine_clubs (
    id SERIAL PRIMARY KEY,
    club_name VARCHAR(255) NOT NULL,
    member_name VARCHAR(255) NOT NULL,
    member_email VARCHAR(255),
    member_phone VARCHAR(50),
    membership_tier VARCHAR(100) DEFAULT 'Standard',
    bottles_per_shipment INTEGER DEFAULT 2,
    shipment_frequency VARCHAR(50) DEFAULT 'Monthly',
    price_per_shipment DECIMAL(10,2),
    preferences VARCHAR(500),
    start_date DATE,
    renewal_date DATE,
    is_active BOOLEAN DEFAULT TRUE,
    total_shipments INTEGER DEFAULT 0,
    lifetime_value DECIMAL(10,2) DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Reservations
CREATE TABLE IF NOT EXISTS reservations (
    id SERIAL PRIMARY KEY,
    guest_name VARCHAR(255) NOT NULL,
    guest_email VARCHAR(255),
    guest_phone VARCHAR(50),
    party_size INTEGER DEFAULT 2,
    reservation_date DATE NOT NULL,
    reservation_time VARCHAR(50),
    event_type VARCHAR(100) DEFAULT 'Tasting',
    duration_minutes INTEGER DEFAULT 60,
    room_location VARCHAR(255),
    wines_requested TEXT,
    special_requests TEXT,
    status VARCHAR(50) DEFAULT 'confirmed',
    deposit_amount DECIMAL(10,2),
    deposit_paid BOOLEAN DEFAULT FALSE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Maintenance Log
CREATE TABLE IF NOT EXISTS maintenance_log (
    id SERIAL PRIMARY KEY,
    equipment_name VARCHAR(255) NOT NULL,
    maintenance_type VARCHAR(100) NOT NULL,
    zone_location VARCHAR(255),
    performed_by VARCHAR(255),
    maintenance_date DATE DEFAULT CURRENT_DATE,
    next_due_date DATE,
    cost DECIMAL(10,2),
    vendor VARCHAR(255),
    priority VARCHAR(50) DEFAULT 'medium',
    status VARCHAR(50) DEFAULT 'completed',
    description TEXT,
    parts_replaced TEXT,
    warranty_status VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
