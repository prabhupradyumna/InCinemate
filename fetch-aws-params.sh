#!/bin/bash

# AWS Parameter Store Environment Variables Fetcher
# This script fetches environment variables from AWS Parameter Store

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    print_error "AWS CLI is not installed. Please install it first."
    exit 1
fi

# Check if AWS credentials are configured
if ! aws sts get-caller-identity &> /dev/null; then
    print_error "AWS credentials not configured. Please run 'aws configure' or attach an IAM role."
    echo ""
    echo "To configure AWS credentials:"
    echo "1. Run: aws configure"
    echo "2. Enter your Access Key ID"
    echo "3. Enter your Secret Access Key"
    echo "4. Enter your region (ap-south-1)"
    echo ""
    echo "Or attach an IAM role to your EC2 instance with SSM permissions."
    exit 1
fi

print_status "Fetching backend environment variables from AWS Parameter Store..."

# Fetch backend parameters
BACKEND_PARAMS=$(aws ssm get-parameter --name "booknwatch_backend_env" --with-decryption --query 'Parameter.Value' --output text 2>/dev/null || echo "")

if [ -z "$BACKEND_PARAMS" ]; then
    print_error "Failed to fetch backend parameters from AWS Parameter Store"
    print_warning "Make sure the parameter 'booknwatch_backend_env' exists and you have permissions"
    exit 1
fi

print_status "Backend parameters fetched successfully!"

# Create backend .env file
echo "$BACKEND_PARAMS" > /home/ubuntu/InCinemate/backend/.env
print_status "Backend .env file updated from AWS Parameter Store"

print_status "Fetching frontend environment variables from AWS Parameter Store..."

# Fetch frontend parameters
FRONTEND_PARAMS=$(aws ssm get-parameter --name "booknwatch_frontend_env" --with-decryption --query 'Parameter.Value' --output text 2>/dev/null || echo "")

if [ -z "$FRONTEND_PARAMS" ]; then
    print_error "Failed to fetch frontend parameters from AWS Parameter Store"
    print_warning "Make sure the parameter 'booknwatch_frontend_env' exists and you have permissions"
    exit 1
fi

print_status "Frontend parameters fetched successfully!"

# Create frontend .env file
echo "$FRONTEND_PARAMS" > /home/ubuntu/InCinemate/frontend/.env
print_status "Frontend .env file updated from AWS Parameter Store"

print_status "Environment variables successfully fetched from AWS Parameter Store!"
print_status "You can now start your application with: ./start-app.sh"
