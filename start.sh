#!/bin/bash

# ============================================
# AI Wine/Spirits Inventory & Sommelier
# Start Script
# ============================================

set -e

PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$PROJECT_DIR"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m'

echo -e "${PURPLE}"
echo "================================================"
echo "   AI Wine/Spirits Inventory & Sommelier"
echo "   Starting Application..."
echo "================================================"
echo -e "${NC}"

# Load env
if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
fi

BACKEND_PORT=${BACKEND_PORT:-3001}
FRONTEND_PORT=${FRONTEND_PORT:-3000}

# Kill processes on ports
echo -e "${YELLOW}Cleaning up ports $BACKEND_PORT and $FRONTEND_PORT...${NC}"
lsof -ti:$BACKEND_PORT 2>/dev/null | xargs kill -9 2>/dev/null || true
lsof -ti:$FRONTEND_PORT 2>/dev/null | xargs kill -9 2>/dev/null || true
sleep 1
echo -e "${GREEN}Ports cleaned.${NC}"

# Check PostgreSQL
echo -e "${BLUE}Checking PostgreSQL...${NC}"
if ! pg_isready -q 2>/dev/null; then
  echo -e "${YELLOW}Starting PostgreSQL...${NC}"
  brew services start postgresql@14 2>/dev/null || brew services start postgresql 2>/dev/null || true
  sleep 2
fi

if pg_isready -q 2>/dev/null; then
  echo -e "${GREEN}PostgreSQL is running.${NC}"
else
  echo -e "${RED}PostgreSQL is not running. Please start it manually.${NC}"
  exit 1
fi

# Create database if not exists
echo -e "${BLUE}Setting up database...${NC}"
DB_NAME=${DB_NAME:-wine_sommelier}
DB_USER=${DB_USER:-postgres}

# Try to create the database (ignore error if exists)
createdb -U "$DB_USER" "$DB_NAME" 2>/dev/null || true
echo -e "${GREEN}Database '$DB_NAME' ready.${NC}"

# Install backend dependencies
echo -e "${BLUE}Installing backend dependencies...${NC}"
cd "$PROJECT_DIR/backend"
npm install --silent 2>&1 | tail -1
echo -e "${GREEN}Backend dependencies installed.${NC}"

# Run seed
echo -e "${BLUE}Seeding database with sample data...${NC}"
# Drop existing tables and recreate
psql -U "$DB_USER" -d "$DB_NAME" -c "
  DROP TABLE IF EXISTS tasting_notes CASCADE;
  DROP TABLE IF EXISTS food_pairings CASCADE;
  DROP TABLE IF EXISTS price_optimization CASCADE;
  DROP TABLE IF EXISTS vintage_valuation CASCADE;
  DROP TABLE IF EXISTS cellar_alerts CASCADE;
  DROP TABLE IF EXISTS sales CASCADE;
  DROP TABLE IF EXISTS cocktail_recipes CASCADE;
  DROP TABLE IF EXISTS deliveries CASCADE;
  DROP TABLE IF EXISTS suppliers CASCADE;
  DROP TABLE IF EXISTS wine_events CASCADE;
  DROP TABLE IF EXISTS customers CASCADE;
  DROP TABLE IF EXISTS wishlist CASCADE;
  DROP TABLE IF EXISTS temperature_log CASCADE;
  DROP TABLE IF EXISTS staff CASCADE;
  DROP TABLE IF EXISTS inventory CASCADE;
  DROP TABLE IF EXISTS users CASCADE;
" 2>/dev/null || true

node seed.js
echo -e "${GREEN}Database seeded successfully!${NC}"

# Install frontend dependencies
echo -e "${BLUE}Installing frontend dependencies...${NC}"
cd "$PROJECT_DIR/frontend"
npm install --silent 2>&1 | tail -1
echo -e "${GREEN}Frontend dependencies installed.${NC}"

# Start backend with nodemon for auto-reload
echo -e "${BLUE}Starting backend on port $BACKEND_PORT with auto-reload...${NC}"
cd "$PROJECT_DIR/backend"
npx nodemon server.js &
BACKEND_PID=$!
sleep 2

# Start frontend with auto-reload (React default)
echo -e "${BLUE}Starting frontend on port $FRONTEND_PORT with auto-reload...${NC}"
cd "$PROJECT_DIR/frontend"
BROWSER=none PORT=$FRONTEND_PORT npm start &
FRONTEND_PID=$!

# Trap to clean up on exit
cleanup() {
  echo -e "\n${YELLOW}Shutting down...${NC}"
  kill $BACKEND_PID 2>/dev/null || true
  kill $FRONTEND_PID 2>/dev/null || true
  lsof -ti:$BACKEND_PORT 2>/dev/null | xargs kill -9 2>/dev/null || true
  lsof -ti:$FRONTEND_PORT 2>/dev/null | xargs kill -9 2>/dev/null || true
  echo -e "${GREEN}Application stopped.${NC}"
  exit 0
}

trap cleanup SIGINT SIGTERM

echo -e "\n${GREEN}================================================${NC}"
echo -e "${GREEN}   Application Started Successfully!${NC}"
echo -e "${GREEN}================================================${NC}"
echo -e "${BLUE}   Frontend: http://localhost:$FRONTEND_PORT${NC}"
echo -e "${BLUE}   Backend:  http://localhost:$BACKEND_PORT${NC}"
echo -e "${PURPLE}   Login:    admin@winesommelier.com / admin123${NC}"
echo -e "${GREEN}================================================${NC}"
echo -e "${YELLOW}   Press Ctrl+C to stop all services${NC}"
echo -e "${GREEN}================================================${NC}\n"

# Wait for processes
wait
