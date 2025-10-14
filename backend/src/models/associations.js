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
import { defineSeatPricing } from './SeatPricing.js'

export function setupAssociations(sequelize) {
  // Define all models
  const User = defineUser(sequelize)
  const Tenant = defineTenant(sequelize)
  const RefreshToken = defineRefreshToken(sequelize)
  const Permission = definePermission(sequelize)
  const AdminPermission = defineAdminPermission(sequelize)
  const Theatre = defineTheatre(sequelize)
  const AuditoriumRequest = defineAuditoriumRequest(sequelize)
  const Auditorium = defineAuditorium(sequelize)
  const Seat = defineSeat(sequelize)
  const Movie = defineMovie(sequelize)
  const Show = defineShow(sequelize)
  const Booking = defineBooking(sequelize)
  const BookedSeat = defineBookedSeat(sequelize)
  const Coupon = defineCoupon(sequelize)
  const SeatPricing = defineSeatPricing(sequelize)

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
  // Auditorium.belongsTo(Theatre, { foreignKey: 'theatre_id', as: 'Theatre' }) // ❌ Removed - already defined in Auditorium model

  // Auditorium & Seat associations
  Auditorium.hasMany(Seat, { foreignKey: 'auditorium_id' })
  Seat.belongsTo(Auditorium, { foreignKey: 'auditorium_id' })

  // SeatPricing associations
  Seat.hasMany(SeatPricing, { foreignKey: 'seat_id' })
  SeatPricing.belongsTo(Seat, { foreignKey: 'seat_id' })
  Auditorium.hasMany(SeatPricing, { foreignKey: 'auditorium_id' })
  SeatPricing.belongsTo(Auditorium, { foreignKey: 'auditorium_id' })
  Show.hasMany(SeatPricing, { foreignKey: 'show_id' })
  SeatPricing.belongsTo(Show, { foreignKey: 'show_id' })

  // Auditorium Request associations
  Tenant.hasMany(AuditoriumRequest, { foreignKey: 'tenant_id', sourceKey: 'tenant_id' })
  AuditoriumRequest.belongsTo(Tenant, { foreignKey: 'tenant_id', targetKey: 'tenant_id' })
  
  Theatre.hasMany(AuditoriumRequest, { foreignKey: 'theatre_id' })
  // AuditoriumRequest.belongsTo(Theatre, { foreignKey: 'theatre_id' }) // ❌ Removed - not needed for current functionality

  User.hasMany(AuditoriumRequest, { foreignKey: 'approved_by', as: 'approvedRequests' })
  // Movie associations
  Tenant.hasMany(Movie, { foreignKey: 'tenant_id', sourceKey: 'tenant_id' })
  Movie.belongsTo(Tenant, { foreignKey: 'tenant_id', targetKey: 'tenant_id' })

  // Show associations
  Movie.hasMany(Show, { foreignKey: 'movie_id', as: 'shows' })
  Show.belongsTo(Movie, { foreignKey: 'movie_id', as: 'Movie' })

  Tenant.hasMany(Show, { foreignKey: 'tenant_id', sourceKey: 'tenant_id' })
  Show.belongsTo(Tenant, { foreignKey: 'tenant_id', targetKey: 'tenant_id' })

  Auditorium.hasMany(Show, { foreignKey: 'auditorium_id' })
  Show.belongsTo(Auditorium, { foreignKey: 'auditorium_id', as: 'Auditorium' })

  User.hasMany(Show, { foreignKey: 'created_by', as: 'createdShows' })
  Show.belongsTo(User, { foreignKey: 'created_by', as: 'CreatedBy' })

  // Booking associations (updated)
  User.hasMany(Booking, { foreignKey: 'customer_id', as: 'customerBookings' })
  Booking.belongsTo(User, { foreignKey: 'customer_id', as: 'customer' })
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

  return {
    User,
    Tenant,
    RefreshToken,
    Permission,
    AdminPermission,
    Theatre,
    AuditoriumRequest,
    Auditorium,
    Seat,
    Movie,
    Show,
    Booking,
    BookedSeat,
    Coupon,
    SeatPricing
  }
}
