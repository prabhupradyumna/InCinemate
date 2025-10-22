#!/bin/bash

# InCinemate Application Management Script
# This script provides convenient commands to manage the application

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
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

print_header() {
    echo -e "${BLUE}=== $1 ===${NC}"
}

# Function to show usage
show_usage() {
    echo "InCinemate Application Manager"
    echo ""
    echo "Usage: $0 [COMMAND]"
    echo ""
echo "Commands:"
echo "  start     - Start the application"
echo "  stop      - Stop the application"
echo "  restart   - Restart the application"
echo "  status    - Show application status"
echo "  logs      - Show application logs"
echo "  logs-tail - Follow application logs"
echo "  build     - Build frontend for production"
echo "  nginx     - Reload nginx configuration"
echo "  service   - Manage systemd service"
echo "  help      - Show this help message"
    echo ""
    echo "Service Commands (use with 'service'):"
    echo "  start     - Start systemd service"
    echo "  stop      - Stop systemd service"
    echo "  restart   - Restart systemd service"
    echo "  status    - Show systemd service status"
    echo "  enable    - Enable service on boot"
    echo "  disable   - Disable service on boot"
}

# Function to start application
start_app() {
    print_header "Starting InCinemate Application"
    ./start-app.sh
}

# Function to stop application
stop_app() {
    print_header "Stopping InCinemate Application"
    ./stop-app.sh
}

# Function to restart application
restart_app() {
    print_header "Restarting InCinemate Application"
    ./stop-app.sh
    sleep 2
    ./start-app.sh
}

# Function to build frontend
build_frontend() {
    print_header "Building Frontend for Production"
    cd frontend
    npm run build
    cd ..
    print_status "Frontend built successfully!"
    print_status "Static assets optimized for nginx serving"
}

# Function to reload nginx
reload_nginx() {
    print_header "Reloading Nginx Configuration"
    sudo nginx -t
    if [ $? -eq 0 ]; then
        sudo systemctl reload nginx
        print_status "Nginx configuration reloaded successfully!"
    else
        print_error "Nginx configuration test failed!"
        exit 1
    fi
}

# Function to show status
show_status() {
    print_header "Application Status"
    if command -v pm2 &> /dev/null; then
        pm2 status
    else
        print_error "PM2 is not installed"
    fi
}

# Function to show logs
show_logs() {
    print_header "Application Logs"
    if command -v pm2 &> /dev/null; then
        pm2 logs --lines 50
    else
        print_error "PM2 is not installed"
    fi
}

# Function to follow logs
follow_logs() {
    print_header "Following Application Logs"
    if command -v pm2 &> /dev/null; then
        pm2 logs
    else
        print_error "PM2 is not installed"
    fi
}

# Function to manage systemd service
manage_service() {
    local service_cmd=$1
    
    case $service_cmd in
        "start")
            print_header "Starting Systemd Service"
            sudo systemctl start incinemate
            ;;
        "stop")
            print_header "Stopping Systemd Service"
            sudo systemctl stop incinemate
            ;;
        "restart")
            print_header "Restarting Systemd Service"
            sudo systemctl restart incinemate
            ;;
        "status")
            print_header "Systemd Service Status"
            sudo systemctl status incinemate
            ;;
        "enable")
            print_header "Enabling Service on Boot"
            sudo systemctl enable incinemate
            ;;
        "disable")
            print_header "Disabling Service on Boot"
            sudo systemctl disable incinemate
            ;;
        *)
            print_error "Unknown service command: $service_cmd"
            echo "Available service commands: start, stop, restart, status, enable, disable"
            ;;
    esac
}

# Main script logic
case $1 in
    "start")
        start_app
        ;;
    "stop")
        stop_app
        ;;
    "restart")
        restart_app
        ;;
    "status")
        show_status
        ;;
    "logs")
        show_logs
        ;;
    "logs-tail")
        follow_logs
        ;;
    "build")
        build_frontend
        ;;
    "nginx")
        reload_nginx
        ;;
    "service")
        manage_service $2
        ;;
    "help"|"--help"|"-h"|"")
        show_usage
        ;;
    *)
        print_error "Unknown command: $1"
        echo ""
        show_usage
        exit 1
        ;;
esac

