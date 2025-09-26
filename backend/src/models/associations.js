import { defineUser } from './User.js'
import { defineTenant } from './Tenant.js'
import { defineRefreshToken } from './RefreshToken.js'
import { definePermission } from './Permission.js'
import { defineAdminPermission } from './AdminPermission.js'
import { defineTheatre } from './Theatre.js'
import { defineAuditoriumRequest } from './AuditoriumRequest.js'
import { defineAuditorium } from './Auditorium.js'
import { defineSeat } from './Seat.js'
import { defineShow } from './Show.js'
import { defineBooking } from './Booking.js'

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
  const Show = defineShow(sequelize)
  const Booking = defineBooking(sequelize)

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

  // Show associations (existing)
  Tenant.hasMany(Show, { foreignKey: 'tenant_id', sourceKey: 'tenant_id' })
  Show.belongsTo(Tenant, { foreignKey: 'tenant_id', targetKey: 'tenant_id' })

  Auditorium.hasMany(Show, { foreignKey: 'auditorium_id' })
  Show.belongsTo(Auditorium, { foreignKey: 'auditorium_id' })

  // Booking associations (existing)
  User.hasMany(Booking, { foreignKey: 'customer_id', as: 'customerBookings' })
  Booking.belongsTo(User, { foreignKey: 'customer_id', as: 'customer' })

  Show.hasMany(Booking, { foreignKey: 'show_id' })
  Booking.belongsTo(Show, { foreignKey: 'show_id' })

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
    Show,
    Booking
  }
}
