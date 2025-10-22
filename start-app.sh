#!/bin/bash

# InCinemate Application Startup Script
# This script installs dependencies and starts the application using PM2

set -e  # Exit on any error

echo "🚀 Starting InCinemate Application..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if PM2 is installed
if ! command -v pm2 &> /dev/null; then
    print_error "PM2 is not installed. Installing PM2 globally..."
    npm install -g pm2
fi

# Navigate to project directory
cd /home/ubuntu/InCinemate

# Install backend dependencies
print_status "Installing backend dependencies..."
cd backend
if [ ! -d "node_modules" ]; then
    npm install
else
    print_warning "Backend node_modules already exists. Skipping installation."
fi

# Install frontend dependencies
print_status "Installing frontend dependencies..."
cd ../frontend
if [ ! -d "node_modules" ]; then
    npm install
else
    print_warning "Frontend node_modules already exists. Skipping installation."
fi

# Build frontend for production
print_status "Building frontend for production..."
npm run build

# Return to project root
cd ..

# Stop any existing PM2 processes
print_status "Stopping any existing PM2 processes..."
pm2 stop ecosystem.config.js 2>/dev/null || true
pm2 delete ecosystem.config.js 2>/dev/null || true

# Start the application using PM2
print_status "Starting application with PM2..."
pm2 start ecosystem.config.js

# Save PM2 configuration
print_status "Saving PM2 configuration..."
pm2 save

# Setup PM2 to start on boot
print_status "Setting up PM2 to start on boot..."
pm2 startup | grep -E '^sudo' | bash || true

# Show PM2 status
print_status "Application started successfully!"
pm2 status

echo ""
echo "🎉 InCinemate is now running!"
echo "📊 Frontend: http://localhost:3000 (PM2 + nginx optimized)"
echo "🔧 Backend: http://localhost:9000"
echo "📝 Logs: /home/ubuntu/logs/"
echo ""
echo "✨ Optimizations:"
echo "   • Static assets served directly by nginx"
echo "   • Long-term caching for static files"
echo "   • Reduced frontend memory usage"
echo ""
echo "Use 'pm2 status' to check status"
echo "Use 'pm2 logs' to view logs"
echo "Use 'pm2 restart ecosystem.config.js' to restart"
echo "Use 'sudo systemctl reload nginx' to reload nginx config"

