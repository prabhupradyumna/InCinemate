/**
 * Application Constants
 * Centralized configuration for the InCinemate application
 */

// ==============================
// AUTHENTICATION & AUTHORIZATION
// ==============================

export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  CUSTOMER: 'customer'
}

export const ROLE_HIERARCHY = {
  [ROLES.SUPER_ADMIN]: 3,
  [ROLES.ADMIN]: 2,
  [ROLES.CUSTOMER]: 1
}

// ==============================
// TOKEN CONFIGURATION
// ==============================

export const TOKEN_CONFIG = {
  // Access Token Settings
  ACCESS_TOKEN: {
    EXPIRY: '30m', // 30 minutes
    TYPE: 'access'
  },
  
  // Refresh Token Settings
  REFRESH_TOKEN: {
    EXPIRY: '7d', // 7 days
    TYPE: 'refresh'
  },
  
  // Cookie Settings
  COOKIE: {
    MAX_AGE: '7d', // 7 days
    HTTP_ONLY: true,
    SAME_SITE: 'Lax',
    SECURE: process.env.NODE_ENV === 'production',
    PATH: '/'
  }
}

// ==============================
// REDIS CONFIGURATION
// ==============================

export const REDIS_CONFIG = {
  // Cache Key Prefixes
  PREFIXES: {
    ACCESS_TOKEN: 'access_token:',
    USER_TOKENS: 'user_tokens:',
    BLACKLIST: 'blacklist:'
  },
  
  // Default TTL Settings (in seconds)
  TTL: {
    ACCESS_TOKEN_SECONDS: 1800, // 30 minutes
    USER_TOKENS_SECONDS: 1800, // 30 minutes
    BLACKLIST_SECONDS: 1800 // 30 minutes
  },
  
  // Connection Settings
  CONNECTION: {
    URL: process.env.REDIS_URL || 'redis://localhost:6379',
    CONNECT_TIMEOUT: 2000, // 2 seconds
    COMMAND_TIMEOUT: 1000, // 1 second
    MAX_RETRIES: 3,
    RETRY_DELAY: 1000 // 1 second max between retries
  }
}

// ==============================
// DATABASE CONFIGURATION
// ==============================

export const DATABASE_CONFIG = {
  // Pool Settings
  POOL: {
    MAX: Number(process.env.DB_POOL_MAX || 10),
    MIN: Number(process.env.DB_POOL_MIN || 0),
    ACQUIRE_MS: Number(process.env.DB_POOL_ACQUIRE_MS || 30000),
    IDLE_MS: Number(process.env.DB_POOL_IDLE_MS || 10000)
  },
  
  // Retry Settings
  RETRY: {
    MAX: Number(process.env.DB_RETRY_MAX || 3)
  },
  
  // Sync Settings
  SYNC: {
    ALTER: String(process.env.DB_SYNC_ALTER || '').toLowerCase() === 'true'
  },
  
  // Logging
  LOGGING: {
    SQL: process.env.LOG_SQL === 'true'
  }
}

// ==============================
// SERVER CONFIGURATION
// ==============================

export const SERVER_CONFIG = {
  PORT: Number(process.env.PORT || 4000),
  NODE_ENV: process.env.NODE_ENV || 'development',
  
  // CORS Settings
  CORS: {
    ORIGINS: (process.env.ORIGIN_URLS || process.env.ORIGIN_URL || 'http://localhost:5173')
      .split(',')
      .map((o) => o.trim())
      .filter(Boolean),
    CREDENTIALS: true
  }
}

// ==============================
// TENANT CONFIGURATION
// ==============================

export const TENANT_CONFIG = {
  RESOLUTION: {
    STRATEGY: process.env.TENANT_RESOLUTION || 'host',
    HEADER: process.env.TENANT_HEADER || 'x-tenant-id'
  },
  
  // Resolution Strategies
  STRATEGIES: {
    HOST: 'host',
    HEADER: 'header',
    PARAM: 'param'
  }
}

// ==============================
// SHOW STATUS
// ==============================

export const SHOW_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  LIVE: 'live',
  COMPLETED: 'completed'
}

// ==============================
// BOOKING STATUS
// ==============================

export const BOOKING_STATUS = {
  PENDING: 'pending',
  PAID: 'paid',
  CANCELLED: 'cancelled'
}

// ==============================
// PASSWORD CONFIGURATION
// ==============================

export const PASSWORD_CONFIG = {
  SALT_ROUNDS: 10,
  MIN_LENGTH: 8,
  REQUIRE_UPPERCASE: false,
  REQUIRE_LOWERCASE: true,
  REQUIRE_NUMBERS: false,
  REQUIRE_SPECIAL_CHARS: false
}

// ==============================
// API RESPONSE MESSAGES
// ==============================

export const API_MESSAGES = {
  // Success Messages
  SUCCESS: {
    LOGIN: 'Login successful',
    LOGOUT: 'Logged out successfully',
    TOKEN_REFRESHED: 'Token refreshed successfully',
    USER_FETCHED: 'Current user fetched',
    CACHE_CLEARED: 'Token cache cleared successfully',
    CACHE_STATS: 'Cache statistics retrieved'
  },
  
  // Error Messages
  ERROR: {
    INVALID_CREDENTIALS: 'Invalid credentials',
    TOKEN_REQUIRED: 'No token provided',
    TOKEN_INVALID: 'Invalid or expired token',
    TOKEN_REVOKED: 'Token has been revoked',
    USER_NOT_FOUND: 'User not found',
    TENANT_NOT_FOUND: 'Invalid or inactive tenant',
    ADMIN_NOT_ASSIGNED: 'Admin not assigned to any tenant',
    INSUFFICIENT_ROLE: 'Forbidden: insufficient role',
    EMAIL_PASSWORD_REQUIRED: 'Email and password required',
    REFRESH_TOKEN_REQUIRED: 'Refresh token required',
    INVALID_REFRESH_TOKEN: 'Invalid or revoked refresh token',
    CACHE_ERROR: 'Failed to get cache stats',
    CACHE_CLEAR_ERROR: 'Failed to clear cache'
  }
}

// ==============================
// HTTP STATUS CODES
// ==============================

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500
}


// ==============================
// EXPORT ALL CONSTANTS
// ==============================

export default {
  ROLES,
  ROLE_HIERARCHY,
  TOKEN_CONFIG,
  REDIS_CONFIG,
  DATABASE_CONFIG,
  SERVER_CONFIG,
  TENANT_CONFIG,
  SHOW_STATUS,
  BOOKING_STATUS,
  PASSWORD_CONFIG,
  API_MESSAGES,
  HTTP_STATUS
}
