#!/usr/bin/env node

/**
 * PhonePe Payment Environment Setup Script
 * 
 * This script helps set up the environment variables for PhonePe payment integration.
 * Run this script to create a .env file with the required PhonePe configuration.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envPath = path.join(__dirname, '.env');

console.log('🔧 PhonePe Payment Environment Setup');
console.log('=====================================\n');

// Check if .env already exists
if (fs.existsSync(envPath)) {
  console.log('⚠️  .env file already exists!');
  console.log('Please backup your existing .env file before running this setup.\n');
  process.exit(1);
}

// Default environment template
const envTemplate = `# Database Configuration
DATABASE_URL=postgres://username:password@localhost:5432/inflow
DB_SYNC_ALTER=true
DB_SYNC_FORCE=false
LOG_SQL=false

# JWT Configuration
JWT_SECRET=your_jwt_secret_here_${Math.random().toString(36).substring(2, 15)}
JWT_REFRESH_SECRET=your_jwt_refresh_secret_here_${Math.random().toString(36).substring(2, 15)}

# Server Configuration
NODE_ENV=development
PORT=9000
ORIGIN_URLS=http://localhost:3000,http://localhost:3001,http://localhost:3002

# Redis Configuration
REDIS_URL=redis://localhost:6379

# PhonePe Payment Gateway Configuration
# ====================================
# Replace these values with your actual PhonePe sandbox credentials
PHONEPE_BASE_URL=https://api-preprod.phonepe.com/apis/pg-sandbox
PHONEPE_MERCHANT_ID=YOUR_MERCHANT_ID
PHONEPE_CLIENT_ID=TEST-M23FQVLBOWM35_25100
PHONEPE_CLIENT_SECRET=NjYyNzY1ZmYtNjQwNy00ZTg1LTg4ODktNzRjMTJhMzBhNjRl
PHONEPE_CLIENT_VERSION=1
PHONEPE_SALT_KEY=099eb0cd-02cf-4e2a-8aca-3e6c6a343418
PHONEPE_SALT_INDEX=1
PHONEPE_REDIRECT_URL=http://localhost:3002/payment-success
PHONEPE_CALLBACK_URL=http://localhost:9000/api/payments/phonepe-callback
FRONTEND_URL=http://localhost:3002
BACKEND_URL=http://localhost:9000

# Email Configuration (SendGrid)
SENDGRID_API_KEY=your_sendgrid_api_key_here
FROM_EMAIL=noreply@yourdomain.com

# SMS Configuration (Twilio)
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number

# Tenant Configuration
TENANT_RESOLUTION=host
TENANT_HEADER=x-tenant-id

# Model Management
MODEL_AUTO_SYNC=true
MODEL_CACHE=true
MODEL_REQUEST_SCOPED=false
`;

try {
  // Write .env file
  fs.writeFileSync(envPath, envTemplate);
  
  console.log('✅ .env file created successfully!');
  console.log('📝 Please update the following PhonePe credentials in your .env file:');
  console.log('   - PHONEPE_CLIENT_ID');
  console.log('   - PHONEPE_CLIENT_SECRET');
  console.log('   - PHONEPE_SALT_KEY');
  console.log('   - PHONEPE_MERCHANT_ID (if available)');
  console.log('');
  console.log('🔗 Get your credentials from: https://developer.phonepe.com/');
  console.log('');
  console.log('🚀 Next steps:');
  console.log('   1. Update the PhonePe credentials in .env');
  console.log('   2. Run database migration: npm run migrate:payment');
  console.log('   3. Start the backend server: npm run dev');
  console.log('   4. Test payment integration');
  console.log('');
  console.log('📚 For more information, check the README.md file.');

} catch (error) {
  console.error('❌ Error creating .env file:', error.message);
  process.exit(1);
}
