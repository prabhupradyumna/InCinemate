#!/bin/bash

# InCinemate Application Shutdown Script
# This script gracefully stops the application using PM2

set -e  # Exit on any error

echo "🛑 Stopping InCinemate Application..."

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
    print_error "PM2 is not installed. Nothing to stop."
    exit 1
fi

# Navigate to project directory
cd /home/ubuntu/InCinemate

# Stop PM2 processes gracefully
print_status "Stopping PM2 processes..."
pm2 stop ecosystem.config.js 2>/dev/null || print_warning "No processes found to stop"

# Delete PM2 processes
print_status "Deleting PM2 processes..."
pm2 delete ecosystem.config.js 2>/dev/null || print_warning "No processes found to delete"

# Save PM2 configuration (empty state)
print_status "Saving PM2 configuration..."
pm2 save

# Show PM2 status
print_status "Application stopped successfully!"
pm2 status

echo ""
echo "✅ InCinemate has been stopped!"
echo "🔄 Use './start-app.sh' to start again"
echo "📝 Logs are preserved in /home/ubuntu/logs/"

