import { defineUser } from '../models/User.js'
import { defineTenant } from '../models/Tenant.js'
import { definePermission } from '../models/Permission.js'
import { defineAdminPermission } from '../models/AdminPermission.js'
import { defineTheatre } from '../models/Theatre.js'
import { defineAuditoriumRequest } from '../models/AuditoriumRequest.js'
import { defineAuditorium } from '../models/Auditorium.js'
import { defineSeat } from '../models/Seat.js'
import { hashPassword, generateTemporaryPassword } from '../util/auth.util.js'
import { ROLES, API_MESSAGES, HTTP_STATUS } from '../constants.js'

export default class SuperadminController {
  // ==============================
  // TENANT MANAGEMENT
  // ==============================

  static async createTenant(req, res) {
    try {
      const { tenant_id, name, owner_name, email, phone, address, city, state, country, postal_code } = req.body

      if (!tenant_id || !name) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({ success: false, error: 'tenant_id and name are required', message: 'Tenant creation failed' })
      }

      const sequelize = req.db
      const Tenant = defineTenant(sequelize)
      await Tenant.sync()

      const [tenant, created] = await Tenant.findOrCreate({
        where: { tenant_id },
        defaults: { tenant_id, name, owner_name, email, phone, address, city, state, country, postal_code, is_active: true }
      })

      return res.status(created ? HTTP_STATUS.CREATED : HTTP_STATUS.OK).json({ data: tenant, message: created ? 'Tenant created' : 'Tenant exists' })
    } catch (err) {
      console.error(`[SuperadminController]-[createTenant]: ${err.message}`)
      return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ success: false, error: err.message, message: 'Tenant creation failed' })
    }
  }

  static async listTenants(req, res) {
    try {
      const sequelize = req.db
      const Tenant = defineTenant(sequelize)
      await Tenant.sync()

      const tenants = await Tenant.findAll({ order: [['name', 'ASC']] })
      return res.json({ data: tenants, message: 'Tenants retrieved' })
    } catch (err) {
      console.error(`[SuperadminController]-[listTenants]: ${err.message}`)
      return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ success: false, error: err.message, message: 'Failed to retrieve tenants' })
    }
  }
  // ==============================
  // ADMIN MANAGEMENT
  // ==============================

  static async createAdmin(req, res) {
    try {
      const { email, full_name, phone, tenant_id, password } = req.body

      if (!email || !full_name || !tenant_id || !password) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          error: 'Email, full name, tenant ID and password are required',
          message: 'Admin creation failed'
        })
      }

      const sequelize = req.db
      const User = defineUser(sequelize)
      const Tenant = defineTenant(sequelize)
      await Promise.all([User.sync(), Tenant.sync()])

      // Verify tenant exists
      const tenant = await Tenant.findOne({ where: { tenant_id } })
      if (!tenant) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({
          success: false,
          error: 'Tenant not found',
          message: 'Admin creation failed'
        })
      }

      // Check if user already exists
      const existingUser = await User.findOne({ where: { email } })
      if (existingUser) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          error: 'User with this email already exists',
          message: 'Admin creation failed'
        })
      }

      // Use provided password only (min length validation)
      const plainPassword = String(password).trim()
      if (plainPassword.length < 6) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          error: 'Password must be at least 6 characters',
          message: 'Admin creation failed'
        })
      }
      const passwordHash = await hashPassword(plainPassword)

      // Create admin user
      const admin = await User.create({
        email,
        password_hash: passwordHash,
        role: ROLES.ADMIN,
        tenant_id,
        full_name,
        phone,
        is_active: true
      })

      // TODO: Send welcome email with credentials (handled separately)

      return res.status(HTTP_STATUS.CREATED).json({
        data: {
          id: admin.id,
          email: admin.email,
          full_name: admin.full_name,
          phone: admin.phone,
          tenant_id: admin.tenant_id,
          role: admin.role
        },
        message: 'Admin created successfully'
      })

    } catch (err) {
      console.error(`[SuperadminController]-[createAdmin]: ${err.message}`)
      return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: err.message,
        message: 'Admin creation failed'
      })
    }
  }

  static async listAdmins(req, res) {
    try {
      const sequelize = req.db
      const User = defineUser(sequelize)
      const Tenant = defineTenant(sequelize)
      await Promise.all([User.sync(), Tenant.sync()])

      // Ensure association on this sequelize instance
      if (!('Tenant' in User.associations)) {
        Tenant.hasMany(User, { foreignKey: 'tenant_id', sourceKey: 'tenant_id' })
        User.belongsTo(Tenant, { foreignKey: 'tenant_id', targetKey: 'tenant_id' })
      }

      const admins = await User.findAll({
        where: { role: ROLES.ADMIN },
        attributes: ['id', 'email', 'full_name', 'phone', 'tenant_id', 'is_active', 'createdAt'],
        include: [{ model: Tenant, attributes: ['tenant_id', 'name'] }]
      })

      return res.json({
        data: admins,
        message: 'Admins retrieved successfully'
      })

    } catch (err) {
      console.error(`[SuperadminController]-[listAdmins]: ${err.message}`)
      return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: err.message,
        message: 'Failed to retrieve admins'
      })
    }
  }

  static async updateAdmin(req, res) {
    try {
      const { id } = req.params
      const { full_name, phone, is_active } = req.body

      const sequelize = req.db
      const User = defineUser(sequelize)
      await User.sync()

      const admin = await User.findOne({
        where: { id, role: ROLES.ADMIN }
      })

      if (!admin) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({
          success: false,
          error: 'Admin not found',
          message: 'Admin update failed'
        })
      }

      // Update admin
      await admin.update({
        full_name: full_name || admin.full_name,
        phone: phone || admin.phone,
        is_active: is_active !== undefined ? is_active : admin.is_active
      })

      return res.json({
        data: {
          id: admin.id,
          email: admin.email,
          full_name: admin.full_name,
          phone: admin.phone,
          is_active: admin.is_active
        },
        message: 'Admin updated successfully'
      })

    } catch (err) {
      console.error(`[SuperadminController]-[updateAdmin]: ${err.message}`)
      return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: err.message,
        message: 'Admin update failed'
      })
    }
  }

  // ==============================
  // PERMISSION MANAGEMENT
  // ==============================

  static async listPermissions(req, res) {
    try {
      const sequelize = req.db
      const Permission = definePermission(sequelize)
      await Permission.sync()

      const permissions = await Permission.findAll({
        order: [['category', 'ASC'], ['name', 'ASC']]
      })

      return res.json({
        data: permissions,
        message: 'Permissions retrieved successfully'
      })

    } catch (err) {
      console.error(`[SuperadminController]-[listPermissions]: ${err.message}`)
      return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: err.message,
        message: 'Failed to retrieve permissions'
      })
    }
  }

  static async getAdminPermissions(req, res) {
    try {
      const { id } = req.params

      const sequelize = req.db
      const User = defineUser(sequelize)
      const Permission = definePermission(sequelize)
      const AdminPermission = defineAdminPermission(sequelize)
      
      // Ensure associations exist on this sequelize instance (req.db)
      // These are needed because request-scoped sequelize may not have global associations applied
      if (!('AdminPermissions' in Permission.associations)) {
        Permission.hasMany(AdminPermission, { foreignKey: 'permission_id', as: 'AdminPermissions' })
      }
      if (!('permission' in AdminPermission.associations)) {
        AdminPermission.belongsTo(Permission, { foreignKey: 'permission_id', as: 'permission' })
      }

      await Promise.all([User.sync(), Permission.sync(), AdminPermission.sync()])

      const admin = await User.findOne({
        where: { id, role: ROLES.ADMIN }
      })

      if (!admin) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({
          success: false,
          error: 'Admin not found',
          message: 'Failed to retrieve admin permissions'
        })
      }

      const permissions = await Permission.findAll({
        include: [{
          model: AdminPermission,
          as: 'AdminPermissions',
          where: { user_id: id },
          required: false,
          attributes: ['granted_at', 'granted_by']
        }],
        order: [['category', 'ASC'], ['name', 'ASC']]
      })

      const formattedPermissions = permissions.map(permission => ({
        id: permission.id,
        name: permission.name,
        description: permission.description,
        category: permission.category,
        granted: permission.AdminPermissions && permission.AdminPermissions.length > 0,
        granted_at: permission.AdminPermissions?.[0]?.granted_at || null,
        granted_by: permission.AdminPermissions?.[0]?.granted_by || null
      }))

      return res.json({
        data: {
          admin: {
            id: admin.id,
            email: admin.email,
            full_name: admin.full_name
          },
          permissions: formattedPermissions
        },
        message: 'Admin permissions retrieved successfully'
      })

    } catch (err) {
      console.error(`[SuperadminController]-[getAdminPermissions]: ${err.message}`)
      return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: err.message,
        message: 'Failed to retrieve admin permissions'
      })
    }
  }

  static async updateAdminPermissions(req, res) {
    try {
      const { id } = req.params
      const { permissions } = req.body // Array of permission IDs to grant

      if (!Array.isArray(permissions)) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          error: 'Permissions must be an array',
          message: 'Permission update failed'
        })
      }

      const sequelize = req.db
      const User = defineUser(sequelize)
      const Permission = definePermission(sequelize)
      const AdminPermission = defineAdminPermission(sequelize)
      
      await Promise.all([User.sync(), Permission.sync(), AdminPermission.sync()])

      const admin = await User.findOne({
        where: { id, role: ROLES.ADMIN }
      })

      if (!admin) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({
          success: false,
          error: 'Admin not found',
          message: 'Permission update failed'
        })
      }

      // Verify all permissions exist
      const validPermissions = await Permission.findAll({
        where: { id: permissions }
      })

      if (validPermissions.length !== permissions.length) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          error: 'One or more permissions not found',
          message: 'Permission update failed'
        })
      }

      // Start transaction
      const transaction = await sequelize.transaction()

      try {
        // Remove all existing permissions for this admin
        await AdminPermission.destroy({
          where: { user_id: id },
          transaction
        })

        // Add new permissions
        const permissionRecords = permissions.map(permissionId => ({
          user_id: id,
          permission_id: permissionId,
          granted_by: req.user.userId
        }))

        await AdminPermission.bulkCreate(permissionRecords, { transaction })

        await transaction.commit()

        return res.json({
          message: 'Admin permissions updated successfully'
        })

      } catch (transactionError) {
        await transaction.rollback()
        throw transactionError
      }

    } catch (err) {
      console.error(`[SuperadminController]-[updateAdminPermissions]: ${err.message}`)
      return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: err.message,
        message: 'Permission update failed'
      })
    }
  }

  // ==============================
  // THEATRE MANAGEMENT
  // ==============================

  static async createTheatre(req, res) {
    try {
      const { name, address, city, state, country, postal_code, tax_rate_percent, contact_phone, contact_email, owner_name } = req.body

      if (!name || !address || !city) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          error: 'Name, address, and city are required',
          message: 'Theatre creation failed'
        })
      }

      const sequelize = req.db
      const Theatre = defineTheatre(sequelize)
      await Theatre.sync()

      const theatre = await Theatre.create({
        name,
        address,
        city,
        state,
        country: country || 'India',
        postal_code,
        tax_rate_percent: tax_rate_percent || 0,
        contact_phone,
        contact_email,
        owner_name,
        is_active: true
      })

      return res.status(HTTP_STATUS.CREATED).json({
        data: theatre,
        message: 'Theatre created successfully'
      })

    } catch (err) {
      console.error(`[SuperadminController]-[createTheatre]: ${err.message}`)
      return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: err.message,
        message: 'Theatre creation failed'
      })
    }
  }

  static async listTheatres(req, res) {
    try {
      const sequelize = req.db
      const Theatre = defineTheatre(sequelize)
      await Theatre.sync()

      const theatres = await Theatre.findAll({
        order: [['city', 'ASC'], ['name', 'ASC']]
      })

      return res.json({
        data: theatres,
        message: 'Theatres retrieved successfully'
      })

    } catch (err) {
      console.error(`[SuperadminController]-[listTheatres]: ${err.message}`)
      return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: err.message,
        message: 'Failed to retrieve theatres'
      })
    }
  }

  // List all auditoriums with theatre info
  static async listAuditoriums(req, res) {
    try {
      const sequelize = req.db
      const Auditorium = defineAuditorium(sequelize)
      const Theatre = defineTheatre(sequelize)
      await Promise.all([Auditorium.sync(), Theatre.sync()])

      // Ensure association exists
      if (!('Theatre' in Auditorium.associations)) {
        Auditorium.belongsTo(Theatre, { foreignKey: 'theatre_id', targetKey: 'id' })
      }

      const auditoriums = await Auditorium.findAll({
        include: [{ model: Theatre, attributes: ['id', 'name', 'city', 'address'] }],
        order: [[Theatre, 'city', 'ASC'], ['name', 'ASC']]
      })

      return res.json({ data: auditoriums, message: 'Auditoriums retrieved successfully' })
    } catch (err) {
      console.error(`[SuperadminController]-[listAuditoriums]: ${err.message}`)
      return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: err.message,
        message: 'Failed to retrieve auditoriums'
      })
    }
  }

  static async getAuditorium(req, res) {
    try {
      const { id } = req.params
      const sequelize = req.db
      const Auditorium = defineAuditorium(sequelize)
      const Theatre = defineTheatre(sequelize)
      await Promise.all([Auditorium.sync(), Theatre.sync()])

      if (!('Theatre' in Auditorium.associations)) {
        Auditorium.belongsTo(Theatre, { foreignKey: 'theatre_id', targetKey: 'id' })
      }

      const auditorium = await Auditorium.findByPk(id, {
        include: [{ model: Theatre, attributes: ['id', 'name', 'city', 'address'] }]
      })

      if (!auditorium) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({ success: false, error: 'Auditorium not found' })
      }

      return res.json({ data: auditorium, message: 'Auditorium retrieved successfully' })
    } catch (err) {
      console.error(`[SuperadminController]-[getAuditorium]: ${err.message}`)
      return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: err.message,
        message: 'Failed to retrieve auditorium'
      })
    }
  }

  static async getAuditoriumSeats(req, res) {
    try {
      const { id } = req.params
      const sequelize = req.db
      const Seat = defineSeat(sequelize)
      await Seat.sync()

      const seats = await Seat.findAll({ where: { auditorium_id: id }, order: [['row', 'ASC'], ['number', 'ASC']] })
      return res.json({ data: seats, message: 'Seats retrieved successfully' })
    } catch (err) {
      console.error(`[SuperadminController]-[getAuditoriumSeats]: ${err.message}`)
      return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ success: false, error: err.message, message: 'Failed to retrieve seats' })
    }
  }

  static async updateAuditoriumConfiguration(req, res) {
    try {
      const { id } = req.params
      const { name, seat_map, configuration } = req.body
      const sequelize = req.db
      const Auditorium = defineAuditorium(sequelize)
      const Seat = defineSeat(sequelize)
      await Promise.all([Auditorium.sync(), Seat.sync()])

      const auditorium = await Auditorium.findByPk(id)
      if (!auditorium) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({ success: false, error: 'Auditorium not found' })
      }

      const transaction = await sequelize.transaction()
      try {
        if (name) await auditorium.update({ name }, { transaction })

        // Replace seats with new seat_map if provided
        if (Array.isArray(seat_map)) {
          await Seat.destroy({ where: { auditorium_id: id }, transaction })
          const records = seat_map.map((s) => ({
            auditorium_id: id,
            row: s.row,
            number: s.number,
            category: s.category,
            x_position: s.x_position ?? 0,
            y_position: s.y_position ?? 0,
            is_active: s.is_active !== false
          }))
          if (records.length > 0) await Seat.bulkCreate(records, { transaction })
          // Keep capacity in sync
          await auditorium.update({ capacity: records.length }, { transaction })
        }

        await transaction.commit()
        return res.json({ message: 'Auditorium configuration updated successfully' })
      } catch (e) {
        await transaction.rollback()
        throw e
      }
    } catch (err) {
      console.error(`[SuperadminController]-[updateAuditoriumConfiguration]: ${err.message}`)
      return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ success: false, error: err.message, message: 'Failed to update auditorium' })
    }
  }

  // ==============================
  // AUDITORIUM REQUEST MANAGEMENT
  // ==============================

  static async listAuditoriumRequests(req, res) {
    try {
      const { status } = req.query

      const sequelize = req.db
      const AuditoriumRequest = defineAuditoriumRequest(sequelize)
      const Tenant = defineTenant(sequelize)
      const Theatre = defineTheatre(sequelize)
      const User = defineUser(sequelize)
      
      await Promise.all([
        AuditoriumRequest.sync(),
        Tenant.sync(),
        Theatre.sync(),
        User.sync()
      ])

      const whereClause = status ? { status } : {}

      const requests = await AuditoriumRequest.findAll({
        where: whereClause,
        include: [
          {
            model: Tenant,
            as: 'Tenant',
            attributes: ['name', 'tenant_id']
          },
          {
            model: Theatre,
            as: 'Theatre',
            attributes: ['name', 'city', 'address']
          },
          {
            model: User,
            as: 'approvedBy',
            attributes: ['full_name', 'email'],
            required: false
          }
        ],
        order: [['created_at', 'DESC']]
      })

      return res.json({
        data: requests,
        message: 'Auditorium requests retrieved successfully'
      })

    } catch (err) {
      console.error(`[SuperadminController]-[listAuditoriumRequests]: ${err.message}`)
      return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: err.message,
        message: 'Failed to retrieve auditorium requests'
      })
    }
  }

  static async updateAuditoriumRequestStatus(req, res) {
    try {
      const { id } = req.params
      const { status, rejection_reason } = req.body

      if (!['approved', 'rejected'].includes(status)) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          error: 'Status must be either "approved" or "rejected"',
          message: 'Request update failed'
        })
      }

      if (status === 'rejected' && !rejection_reason) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          error: 'Rejection reason is required when rejecting a request',
          message: 'Request update failed'
        })
      }

      const sequelize = req.db
      const AuditoriumRequest = defineAuditoriumRequest(sequelize)
      await AuditoriumRequest.sync()

      const request = await AuditoriumRequest.findByPk(id)
      if (!request) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({
          success: false,
          error: 'Auditorium request not found',
          message: 'Request update failed'
        })
      }

      await request.update({
        status,
        approved_by: req.user.userId,
        approved_at: new Date(),
        rejection_reason: status === 'rejected' ? rejection_reason : null
      })

      return res.json({
        data: request,
        message: `Auditorium request ${status} successfully`
      })

    } catch (err) {
      console.error(`[SuperadminController]-[updateAuditoriumRequestStatus]: ${err.message}`)
      return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: err.message,
        message: 'Request update failed'
      })
    }
  }

  // ==============================
  // AUDITORIUM CONFIGURATION
  // ==============================

  static async createAuditoriumConfiguration(req, res) {
    try {
      const { request_id, theatre_id, name, seat_map, total_seats, configuration } = req.body

      if (!theatre_id || !name || !seat_map || !Array.isArray(seat_map)) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          error: 'Missing required fields: theatre_id, name, and seat_map array',
          message: 'Auditorium configuration failed'
        })
      }

      const sequelize = req.db
      const AuditoriumRequest = defineAuditoriumRequest(sequelize)
      const Auditorium = defineAuditorium(sequelize)
      const Seat = defineSeat(sequelize)
      const Theatre = defineTheatre(sequelize)
      
      await Promise.all([
        AuditoriumRequest.sync(),
        Auditorium.sync(),
        Seat.sync(),
        Theatre.sync()
      ])

      // Verify the theatre exists
      const theatre = await Theatre.findByPk(theatre_id)
      if (!theatre) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({
          success: false,
          error: 'Theatre not found',
          message: 'Configuration failed'
        })
      }

      // If request_id is provided, verify the request exists and is approved
      let request = null
      if (request_id && !request_id.startsWith('manual-')) {
        request = await AuditoriumRequest.findByPk(request_id)
        if (!request) {
          return res.status(HTTP_STATUS.NOT_FOUND).json({
            success: false,
            error: 'Auditorium request not found',
            message: 'Configuration failed'
          })
        }

        if (request.status !== 'approved') {
          return res.status(HTTP_STATUS.BAD_REQUEST).json({
            success: false,
            error: 'Auditorium request must be approved before configuration',
            message: 'Configuration failed'
          })
        }
      }

      // Create the auditorium
      const auditorium = await Auditorium.create({
        theatre_id,
        name,
        capacity: (total_seats || seat_map.length || 0),
        configuration: configuration || {},
        is_active: true
      })

      // Create all seats
      const seatPromises = seat_map.map(seatData => 
        Seat.create({
          auditorium_id: auditorium.id,
          row: seatData.row,
          number: seatData.number,
          category: seatData.category,
          x_position: seatData.x_position,
          y_position: seatData.y_position,
          is_active: seatData.is_active !== false
        })
      )

      await Promise.all(seatPromises)
      // Ensure capacity reflects actual seats created
      await auditorium.update({ capacity: seat_map.length })

      // Update the request status to 'configured' if it exists
      if (request) {
        await request.update({
          status: 'configured',
          configured_at: new Date(),
          configured_by: req.user.userId
        })
      }

      return res.status(HTTP_STATUS.CREATED).json({
        data: {
          auditorium,
          seats_created: seat_map.length,
          request_updated: true
        },
        message: 'Auditorium configuration created successfully'
      })

    } catch (err) {
      console.error(`[SuperadminController]-[createAuditoriumConfiguration]: ${err.message}`)
      return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: err.message,
        message: 'Auditorium configuration failed'
      })
    }
  }

  static async getAuditoriumRequest(req, res) {
    try {
      const { id } = req.params

      const sequelize = req.db
      const AuditoriumRequest = defineAuditoriumRequest(sequelize)
      const Theatre = defineTheatre(sequelize)
      
      await Promise.all([
        AuditoriumRequest.sync(),
        Theatre.sync()
      ])

      const request = await AuditoriumRequest.findByPk(id, {
        include: [{
          model: Theatre,
          attributes: ['id', 'name', 'address', 'city', 'state', 'country']
        }]
      })

      if (!request) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({
          success: false,
          error: 'Auditorium request not found',
          message: 'Request retrieval failed'
        })
      }

      return res.json({
        data: request,
        message: 'Auditorium request retrieved successfully'
      })

    } catch (err) {
      console.error(`[SuperadminController]-[getAuditoriumRequest]: ${err.message}`)
      return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: err.message,
        message: 'Request retrieval failed'
      })
    }
  }
}
