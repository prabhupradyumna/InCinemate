import { Sequelize } from 'sequelize'
import dotenv from 'dotenv'
dotenv.config()

// Import all model definitions
import { defineUser } from './User.js'
import { defineTenant } from './Tenant.js'
import { defineRefreshToken } from './RefreshToken.js'
import { definePermission } from './Permission.js'
import { defineAdminPermission } from './AdminPermission.js'
import { defineTheatre } from './Theatre.js'
import { defineAuditoriumRequest } from './AuditoriumRequest.js'
import { defineAuditorium } from './Auditorium.js'
import { defineSeat } from './Seat.js'
import { defineMovie } from './Movie.js'
import { defineShow } from './Show.js'
import { defineBooking } from './Booking.js'
import { defineBookedSeat } from './BookedSeat.js'
import { defineCoupon } from './Coupon.js'

// Import relationship setups
import { setupMovieRelationships } from './MovieRelationships.js'

// Environment-controlled configuration
const MODEL_CONFIG = {
  // Sync control
  SYNC_ALTER: process.env.DB_SYNC_ALTER === 'true',
  SYNC_FORCE: process.env.DB_SYNC_FORCE === 'true',
  SYNC_LOGGING: process.env.LOG_SQL === 'true',
  
  // Model management
  AUTO_SYNC: process.env.MODEL_AUTO_SYNC !== 'false', // Default: true
  CACHE_MODELS: process.env.MODEL_CACHE !== 'false',   // Default: true
  REQUEST_SCOPED: process.env.MODEL_REQUEST_SCOPED === 'true' // Default: false
}

class ModelManager {
  constructor(sequelize) {
    this.sequelize = sequelize
    this.models = null
    this.isInitialized = false
    this.syncPromise = null
  }

  /**
   * Initialize all models and associations
   */
  async initialize() {
    if (this.isInitialized) {
      return this.models
    }

    if (this.syncPromise) {
      return this.syncPromise
    }

    this.syncPromise = this._setupModels()
    this.models = await this.syncPromise
    this.isInitialized = true

    return this.models
  }

  /**
   * Setup all models and their associations
   */
  async _setupModels() {
    console.log('[ModelManager] Initializing models...')

    // Define all models
    const models = {
      User: defineUser(this.sequelize),
      Tenant: defineTenant(this.sequelize),
      RefreshToken: defineRefreshToken(this.sequelize),
      Permission: definePermission(this.sequelize),
      AdminPermission: defineAdminPermission(this.sequelize),
      Theatre: defineTheatre(this.sequelize),
      AuditoriumRequest: defineAuditoriumRequest(this.sequelize),
      Auditorium: defineAuditorium(this.sequelize),
      Seat: defineSeat(this.sequelize),
      Movie: defineMovie(this.sequelize),
      Show: defineShow(this.sequelize),
      Booking: defineBooking(this.sequelize),
      BookedSeat: defineBookedSeat(this.sequelize),
      Coupon: defineCoupon(this.sequelize)
    }

    // Setup core associations
    this._setupCoreAssociations(models)

    // Setup movie-specific relationships
    setupMovieRelationships(this.sequelize)

    // Sync models if enabled
    if (MODEL_CONFIG.AUTO_SYNC) {
      await this._syncModels(models)
    }

    console.log('[ModelManager] Models initialized successfully')
    return models
  }

  /**
   * Setup core associations between models
   */
  _setupCoreAssociations(models) {
    const {
      User, Tenant, RefreshToken, Permission, AdminPermission,
      Theatre, AuditoriumRequest, Auditorium, Seat,
      Movie, Show, Booking, BookedSeat, Coupon
    } = models

    // User & Tenant associations
    Tenant.hasMany(User, { foreignKey: 'tenant_id', sourceKey: 'tenant_id' })
    User.belongsTo(Tenant, { foreignKey: 'tenant_id', targetKey: 'tenant_id' })

    // RefreshToken associations
    User.hasMany(RefreshToken, { foreignKey: 'user_id' })
    RefreshToken.belongsTo(User, { foreignKey: 'user_id' })

    // Permission associations (many-to-many through AdminPermission)
    User.belongsToMany(Permission, { 
      through: AdminPermission, 
      foreignKey: 'user_id',
      otherKey: 'permission_id'
    })
    Permission.belongsToMany(User, { 
      through: AdminPermission, 
      foreignKey: 'permission_id',
      otherKey: 'user_id'
    })

    // Direct linkage for includes on Permission → AdminPermission
    Permission.hasMany(AdminPermission, { foreignKey: 'permission_id', as: 'AdminPermissions' })

    // AdminPermission associations
    AdminPermission.belongsTo(User, { foreignKey: 'user_id', as: 'user' })
    AdminPermission.belongsTo(Permission, { foreignKey: 'permission_id', as: 'permission' })
    AdminPermission.belongsTo(User, { foreignKey: 'granted_by', as: 'grantedBy' })

    // Theatre & Auditorium associations
    Theatre.hasMany(Auditorium, { foreignKey: 'theatre_id' })
    Auditorium.belongsTo(Theatre, { foreignKey: 'theatre_id' })

    // Auditorium & Seat associations
    Auditorium.hasMany(Seat, { foreignKey: 'auditorium_id' })
    Seat.belongsTo(Auditorium, { foreignKey: 'auditorium_id' })

    // Auditorium Request associations
    Tenant.hasMany(AuditoriumRequest, { foreignKey: 'tenant_id', sourceKey: 'tenant_id' })
    AuditoriumRequest.belongsTo(Tenant, { foreignKey: 'tenant_id', targetKey: 'tenant_id' })
    
    Theatre.hasMany(AuditoriumRequest, { foreignKey: 'theatre_id' })
    AuditoriumRequest.belongsTo(Theatre, { foreignKey: 'theatre_id' })

    User.hasMany(AuditoriumRequest, { foreignKey: 'approved_by', as: 'approvedRequests' })
    AuditoriumRequest.belongsTo(User, { foreignKey: 'approved_by', as: 'approvedBy' })

    // Movie associations
    Tenant.hasMany(Movie, { foreignKey: 'tenant_id', sourceKey: 'tenant_id' })
    Movie.belongsTo(Tenant, { foreignKey: 'tenant_id', targetKey: 'tenant_id' })

    // Show associations
    Movie.hasMany(Show, { foreignKey: 'movie_id' })
    Show.belongsTo(Movie, { foreignKey: 'movie_id' })

    Tenant.hasMany(Show, { foreignKey: 'tenant_id', sourceKey: 'tenant_id' })
    Show.belongsTo(Tenant, { foreignKey: 'tenant_id', targetKey: 'tenant_id' })

    Auditorium.hasMany(Show, { foreignKey: 'auditorium_id' })
    Show.belongsTo(Auditorium, { foreignKey: 'auditorium_id' })

    User.hasMany(Show, { foreignKey: 'created_by', as: 'createdShows' })
    Show.belongsTo(User, { foreignKey: 'created_by', as: 'createdBy' })

    // Booking associations
    User.hasMany(Booking, { foreignKey: 'customer_id', as: 'customerBookings' })
    Booking.belongsTo(User, { foreignKey: 'customer_id', as: 'customer' })

    Show.hasMany(Booking, { foreignKey: 'show_id' })
    Booking.belongsTo(Show, { foreignKey: 'show_id' })

    Tenant.hasMany(Booking, { foreignKey: 'tenant_id', sourceKey: 'tenant_id' })
    Booking.belongsTo(Tenant, { foreignKey: 'tenant_id', targetKey: 'tenant_id' })

    // BookedSeat associations (many-to-many between Booking and Seat)
    Booking.belongsToMany(Seat, { through: BookedSeat, foreignKey: 'booking_id' })
    Seat.belongsToMany(Booking, { through: BookedSeat, foreignKey: 'seat_id' })

    BookedSeat.belongsTo(Booking, { foreignKey: 'booking_id' })
    BookedSeat.belongsTo(Seat, { foreignKey: 'seat_id' })

    // Coupon associations
    Tenant.hasMany(Coupon, { foreignKey: 'tenant_id', sourceKey: 'tenant_id' })
    Coupon.belongsTo(Tenant, { foreignKey: 'tenant_id', targetKey: 'tenant_id' })

    User.hasMany(Coupon, { foreignKey: 'created_by', as: 'createdCoupons' })
    Coupon.belongsTo(User, { foreignKey: 'created_by', as: 'createdBy' })

    Booking.belongsTo(Coupon, { foreignKey: 'coupon_id' })
    Coupon.hasMany(Booking, { foreignKey: 'coupon_id' })
  }

  /**
   * Sync models based on environment configuration
   */
  async _syncModels(models) {
    const syncOptions = {
      logging: MODEL_CONFIG.SYNC_LOGGING ? console.log : false
    }

    if (MODEL_CONFIG.SYNC_FORCE) {
      syncOptions.force = true
      console.log('[ModelManager] Force syncing models (will drop and recreate tables)')
    } else if (MODEL_CONFIG.SYNC_ALTER) {
      syncOptions.alter = true
      console.log('[ModelManager] Alter syncing models (will modify existing tables)')
    } else {
      console.log('[ModelManager] Standard syncing models (will only create missing tables)')
    }

    try {
      await this.sequelize.sync(syncOptions)
      console.log('[ModelManager] Model sync completed successfully')
    } catch (error) {
      console.error('[ModelManager] Model sync failed:', error.message)
      throw error
    }
  }

  /**
   * Get models for use in controllers
   * Returns either cached global models or creates request-scoped models
   */
  getModels() {
    if (MODEL_CONFIG.REQUEST_SCOPED) {
      return this._createRequestScopedModels()
    }
    
    if (!this.isInitialized) {
      throw new Error('ModelManager not initialized. Call initialize() first.')
    }
    
    return this.models
  }

  /**
   * Create request-scoped models (for backward compatibility)
   */
  _createRequestScopedModels() {
    return {
      User: defineUser(this.sequelize),
      Tenant: defineTenant(this.sequelize),
      RefreshToken: defineRefreshToken(this.sequelize),
      Permission: definePermission(this.sequelize),
      AdminPermission: defineAdminPermission(this.sequelize),
      Theatre: defineTheatre(this.sequelize),
      AuditoriumRequest: defineAuditoriumRequest(this.sequelize),
      Auditorium: defineAuditorium(this.sequelize),
      Seat: defineSeat(this.sequelize),
      Movie: defineMovie(this.sequelize),
      Show: defineShow(this.sequelize),
      Booking: defineBooking(this.sequelize),
      BookedSeat: defineBookedSeat(this.sequelize),
      Coupon: defineCoupon(this.sequelize)
    }
  }

  /**
   * Get configuration info
   */
  getConfig() {
    return { ...MODEL_CONFIG }
  }
}

// Export singleton instance
let modelManager = null

export function getModelManager(sequelize) {
  if (!modelManager) {
    modelManager = new ModelManager(sequelize)
  }
  return modelManager
}

// Export for direct use
export { ModelManager, MODEL_CONFIG }
