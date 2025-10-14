import { defineUser } from '../models/User.js'
import { defineTenant } from '../models/Tenant.js'
import { definePermission } from '../models/Permission.js'
import { defineAdminPermission } from '../models/AdminPermission.js'
import { defineTheatre } from '../models/Theatre.js'
import { defineAuditoriumRequest } from '../models/AuditoriumRequest.js'
import { defineAuditorium } from '../models/Auditorium.js'
import { defineSeat } from '../models/Seat.js'
import { defineSeatPricing } from '../models/SeatPricing.js'
import { defineShow } from '../models/Show.js'
import { defineMovie } from '../models/Movie.js'
import { setupMovieRelationships, syncAllMovieTables, getMovieWithAllRelations, searchMoviesWithCastCrew } from '../models/MovieRelationships.js'
import { hashPassword, generateTemporaryPassword } from '../util/auth.util.js'
import { ROLES, API_MESSAGES, HTTP_STATUS } from '../constants.js'
import { Op } from 'sequelize'

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
      console.log(`[getAuditoriumSeats] Request for auditorium ID: ${id}`)
      
      const sequelize = req.db
      const Seat = defineSeat(sequelize)
      await Seat.sync()

      const seats = await Seat.findAll({ where: { auditorium_id: id }, order: [['row', 'ASC'], ['number', 'ASC']] })
      console.log(`[getAuditoriumSeats] Found ${seats.length} seats for auditorium ${id}`)
      
      if (seats.length > 0) {
        console.log(`[getAuditoriumSeats] First seat:`, {
          id: seats[0].id,
          row: seats[0].row,
          number: seats[0].number,
          category: seats[0].category,
          x_position: seats[0].x_position,
          y_position: seats[0].y_position
        })
        console.log(`[getAuditoriumSeats] All seats data:`, seats.map(s => ({
          id: s.id,
          row: s.row,
          number: s.number,
          category: s.category
        })))
      }
      
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
  // SEAT PRICING (BASE) FOR AUDITORIUM
  // ==============================

  static async bulkUpdateBaseSeatPricing(req, res) {
    try {
      const { auditorium_id } = req.params
      const { filters = {}, price, is_dynamic = false, effective_from = null, effective_to = null } = req.body

      if (price == null || Number(price) <= 0) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({ success: false, error: 'price is required and must be > 0' })
      }

      const sequelize = req.db
      const Seat = defineSeat(sequelize)
      const SeatPricing = defineSeatPricing(sequelize)
      await Promise.all([Seat.sync(), SeatPricing.sync()])

      const where = { auditorium_id }
      if (Array.isArray(filters.categories) && filters.categories.length > 0) {
        where.category = { [Op.in]: filters.categories }
      }
      if (Array.isArray(filters.rows) && filters.rows.length > 0) {
        where.row = { [Op.in]: filters.rows }
      }
      if (Array.isArray(filters.seat_ids) && filters.seat_ids.length > 0) {
        where.id = { [Op.in]: filters.seat_ids }
      }

      const seats = await Seat.findAll({ where, attributes: ['id'] })
      if (seats.length === 0) {
        return res.json({ success: true, data: { updated: 0 }, message: 'No seats matched filters' })
      }

      const transaction = await sequelize.transaction()
      try {
        // Upsert base pricing (show_id null)
        for (const s of seats) {
          // Try update first
          const [count] = await SeatPricing.update(
            { price, currency: 'INR', pricing_type: 'base', is_dynamic, effective_from, effective_to },
            { where: { seat_id: s.id, auditorium_id, show_id: null }, transaction }
          )
          if (count === 0) {
            await SeatPricing.create({
              seat_id: s.id,
              auditorium_id,
              show_id: null,
              price,
              currency: 'INR',
              pricing_type: 'base',
              is_dynamic,
              effective_from,
              effective_to
            }, { transaction })
          }
        }
        await transaction.commit()
        return res.json({ success: true, data: { updated: seats.length }, message: 'Base pricing updated' })
      } catch (e) {
        await transaction.rollback()
        throw e
      }
    } catch (err) {
      console.error(`[SuperadminController]-[bulkUpdateBaseSeatPricing]: ${err.message}`)
      return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ success: false, error: err.message, message: 'Bulk pricing update failed' })
    }
  }

  static async getAuditoriumPricingPreview(req, res) {
    try {
      const { auditorium_id } = req.params
      const { show_id } = req.query
      const sequelize = req.db
      const Seat = defineSeat(sequelize)
      const SeatPricing = defineSeatPricing(sequelize)
      await Promise.all([Seat.sync(), SeatPricing.sync()])

      const seats = await Seat.findAll({ where: { auditorium_id }, attributes: ['id','row','number','category'] })
      const seatIds = seats.map(s => s.id)

      // Fetch base pricing
      const basePricing = await SeatPricing.findAll({ where: { auditorium_id, show_id: null, seat_id: { [Op.in]: seatIds } } })
      const baseMap = new Map(basePricing.map(p => [p.seat_id, Number(p.price)]))

      let showMap = new Map()
      if (show_id) {
        const showPricing = await SeatPricing.findAll({ where: { auditorium_id, show_id, seat_id: { [Op.in]: seatIds } } })
        showMap = new Map(showPricing.map(p => [p.seat_id, Number(p.price)]))
      }

      const result = seats.map(s => ({
        seat_id: s.id,
        row: s.row,
        number: s.number,
        category: s.category,
        base_price: baseMap.get(s.id) ?? null,
        show_price: showMap.get(s.id) ?? null
      }))

      return res.json({ success: true, data: { seats: result }, message: 'Pricing preview generated' })
    } catch (err) {
      console.error(`[SuperadminController]-[getAuditoriumPricingPreview]: ${err.message}`)
      return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ success: false, error: err.message, message: 'Failed to get pricing preview' })
    }
  }

  static async bulkUpdateShowSeatPricing(req, res) {
    try {
      const { show_id } = req.params
      const { seat_pricing } = req.body

      console.log(`[bulkUpdateShowSeatPricing] Called for show_id: ${show_id}`)
      console.log(`[bulkUpdateShowSeatPricing] Seat pricing data:`, seat_pricing)

      if (!Array.isArray(seat_pricing) || seat_pricing.length === 0) {
        console.log(`[bulkUpdateShowSeatPricing] Invalid seat_pricing array`)
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          error: 'seat_pricing array is required and must not be empty'
        })
      }

      const sequelize = req.db
      const Show = defineShow(sequelize)
      const SeatPricing = defineSeatPricing(sequelize)
      await Promise.all([Show.sync(), SeatPricing.sync()])

      // Verify show exists
      const show = await Show.findByPk(show_id)
      if (!show) {
        console.log(`[bulkUpdateShowSeatPricing] Show not found: ${show_id}`)
        return res.status(HTTP_STATUS.NOT_FOUND).json({
          success: false,
          error: 'Show not found'
        })
      }

      console.log(`[bulkUpdateShowSeatPricing] Show found:`, show.id)

      const transaction = await sequelize.transaction()
      try {
        // Delete existing show-specific pricing for this show
        const deletedCount = await SeatPricing.destroy({
          where: { show_id },
          transaction
        })
        console.log(`[bulkUpdateShowSeatPricing] Deleted ${deletedCount} existing pricing records`)

        // Create new show-specific pricing records
        const pricingRecords = seat_pricing.map(item => ({
          seat_id: item.seat_id,
          auditorium_id: show.auditorium_id,
          show_id: show_id,
          price: Number(item.price),
          currency: 'INR',
          pricing_type: 'show_specific',
          is_dynamic: false
        }))

        console.log(`[bulkUpdateShowSeatPricing] Creating ${pricingRecords.length} pricing records`)

        const createdRecords = await SeatPricing.bulkCreate(pricingRecords, { transaction })
        console.log(`[bulkUpdateShowSeatPricing] Created ${createdRecords.length} pricing records`)

        await transaction.commit()

        return res.json({
          success: true,
          data: { updated: pricingRecords.length },
          message: `Show-specific pricing updated for ${pricingRecords.length} seats`
        })
      } catch (error) {
        await transaction.rollback()
        console.error(`[bulkUpdateShowSeatPricing] Transaction error:`, error)
        throw error
      }
    } catch (err) {
      console.error(`[SuperadminController]-[bulkUpdateShowSeatPricing]: ${err.message}`)
      return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: err.message,
        message: 'Failed to update show-specific pricing'
      })
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
        capacity: seat_map.length,
        total_seats: total_seats || seat_map.length,
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

  // ==============================
  // ==============================
  // ENHANCED MOVIE MANAGEMENT (SUPERADMIN)
  // ==============================

  static async createMovie(req, res) {
    try {
      const movieData = req.body
      const { title, tenant_id } = movieData

      // Validation
      if (!title?.trim()) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          error: 'Title is required',
          message: 'Movie creation failed'
        })
      }

      if (!tenant_id?.trim()) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          error: 'Tenant ID is required',
          message: 'Movie creation failed'
        })
      }

      const sequelize = req.db
      const models = await syncAllMovieTables(sequelize)
      const Tenant = defineTenant(sequelize)
      await Tenant.sync()

      // Verify tenant exists
      const tenant = await Tenant.findOne({ where: { tenant_id } })
      if (!tenant) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({
          success: false,
          error: 'Tenant not found',
          message: 'Movie creation failed'
        })
      }

      // Prepare movie data with defaults
      const moviePayload = {
        title: title.trim(),
        tenant_id,
        // Location
        city: (movieData.city || '').trim() || null,
        
        // Media Assets
        poster_url: movieData.poster_url || null,
        backdrop_url: movieData.backdrop_url || null,
        trailer_url: movieData.trailer_url || null,
        additional_trailers: movieData.additional_trailers || [],
        photo_gallery: movieData.photo_gallery || [],
        
        // Content Details
        synopsis: movieData.synopsis || null,
        short_description: movieData.short_description || null,
        tagline: movieData.tagline || null,
        genres: movieData.genres || [],
        sub_genres: movieData.sub_genres || [],
        
        // Basic Info
        duration_minutes: movieData.duration_minutes || null,
        release_date: movieData.release_date || null,
        rating: movieData.rating || null,
        cbfc_certificate: movieData.cbfc_certificate || null,
        content_advisories: movieData.content_advisories || [],
        
        // Languages & Formats
        languages: movieData.languages || ['English'],
        subtitle_languages: movieData.subtitle_languages || [],
        formats: movieData.formats || ['2D'],
        
        // External Ratings
        imdb_rating: movieData.imdb_rating || null,
        rotten_tomatoes: movieData.rotten_tomatoes || null,
        metacritic_score: movieData.metacritic_score || null,
        
        // Production
        production_houses: movieData.production_houses || [],
        distributors: movieData.distributors || [],
        budget: movieData.budget || null,
        
        // Technical
        aspect_ratio: movieData.aspect_ratio || '2.39:1',
        sound_mix: movieData.sound_mix || [],
        camera_used: movieData.camera_used || null,
        
        // Music
        has_songs: movieData.has_songs || false,
        song_count: movieData.song_count || null,
        
        // Booking & Status
        platform_status: movieData.platform_status || 'coming_soon',
        booking_opens_at: movieData.booking_opens_at || null,
        booking_closes_at: movieData.booking_closes_at || null,
        is_re_release: movieData.is_re_release || false,
        
        // Pricing
        suggested_base_price_min: movieData.suggested_base_price_min || null,
        suggested_base_price_max: movieData.suggested_base_price_max || null,
        premium_multiplier: movieData.premium_multiplier || 1.5,
        
        // SEO & Marketing
        meta_title: movieData.meta_title || null,
        meta_description: movieData.meta_description || null,
        keywords: movieData.keywords || [],
        social_hashtags: movieData.social_hashtags || [],
        
        // Features
        is_featured: movieData.is_featured || false,
        is_trending: movieData.is_trending || false,
        banner_campaign_active: movieData.banner_campaign_active || false,
        banner_position: movieData.banner_position || null,
        campaign_start_date: movieData.campaign_start_date || null,
        campaign_end_date: movieData.campaign_end_date || null,
        
        // Additional Info
        things_to_know: movieData.things_to_know || [],
        is_part_of_series: movieData.is_part_of_series || false,
        series_name: movieData.series_name || null,
        series_order: movieData.series_order || null,
        
        // Admin
        // approval_status: movieData.approval_status || 'draft',
        internal_notes: movieData.internal_notes || null,
        is_active: movieData.is_active !== false
      }

      const movie = await models.Movie.create(moviePayload)

      return res.status(HTTP_STATUS.CREATED).json({
        success: true,
        data: movie,
        message: 'Movie created successfully'
      })
    } catch (err) {
      console.error(`[SuperadminController]-[createMovie]: ${err.message}`)
      return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: err.message,
        message: 'Movie creation failed'
      })
    }
  }

  static async listMovies(req, res) {
    try {
      const { 
        page = 1, 
        limit = 10, 
        status, 
        search, 
        genre, 
        language, 
        platform_status,
        tenant_id,
        sort_by = 'created_at',
        sort_order = 'DESC',
        include_relations = 'false'
      } = req.query
      
      const offset = (page - 1) * limit
      const sequelize = req.db

      // Use search function if search parameters provided
      if (search) {
        const searchResults = await searchMoviesWithCastCrew(sequelize, {
          title: search,
          actor: search,
          director: search,
          genre: search,
          limit: parseInt(limit),
          offset: parseInt(offset)
        })

        return res.json({
          success: true,
          data: searchResults.rows,
          pagination: {
            total: searchResults.count,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(searchResults.count / limit)
          },
          message: 'Movies search results retrieved successfully'
        })
      }

      const models = await syncAllMovieTables(sequelize)
      
      // Build where clause
      const where = {}
      if (status === 'active') {
        where.is_active = true
      } else if (status === 'inactive') {
        where.is_active = false
      }
      
      if (genre) {
        where.genres = {
          [sequelize.Sequelize.Op.contains]: [genre]
        }
      }
      
      if (language) {
        where.languages = {
          [sequelize.Sequelize.Op.contains]: [language]
        }
      }
      
      if (platform_status) {
        where.platform_status = platform_status
      }
      
      if (tenant_id) {
        where.tenant_id = tenant_id
      }

      // Build include array
      const include = []
      if (include_relations === 'true') {
        try {
          include.push(
            {
              model: models.MovieCast,
              as: 'castMembers',
              include: [{
                model: models.Actor,
                as: 'actor'
              }],
              required: false,
              separate: true, // Use separate query to avoid SQL issues
              limit: 5,
              order: [['display_order', 'ASC']]
            },
            {
              model: models.MovieCrew,
              as: 'crewMembers',
              include: [{
                model: models.CrewPerson,
                as: 'person'
              }],
              where: {
                role_category: ['direction', 'production'],
                is_primary: true
              },
              required: false,
              separate: true, // Use separate query to avoid SQL issues
              order: [['display_order', 'ASC']]
            }
          )
        } catch (relationError) {
          console.warn('[SuperadminController]-[listMovies]: Relation setup error, proceeding without relations:', relationError.message)
          // Continue without relations if there's an issue
        }
      }

      // Build order clause
      const orderField = sort_by === 'title' ? 'title' :
                        sort_by === 'release_date' ? 'release_date' :
                        sort_by === 'total_bookings' ? 'total_bookings' :
                        sort_by === 'average_user_rating' ? 'average_user_rating' :
                        'created_at'
      
      // Try query with relations first, fallback to basic query if it fails
      let count, movies
      try {
        const result = await models.Movie.findAndCountAll({
          where,
          include,
          limit: parseInt(limit),
          offset: parseInt(offset),
          order: [[orderField, sort_order.toUpperCase()]],
          distinct: true
        })
        count = result.count
        movies = result.rows
      } catch (queryError) {
        console.warn('[SuperadminController]-[listMovies]: Complex query failed, using simple query:', queryError.message)
        // Fallback to basic query without relations
        const result = await models.Movie.findAndCountAll({
          where,
          limit: parseInt(limit),
          offset: parseInt(offset),
          order: [[orderField, sort_order.toUpperCase()]],
          distinct: true
        })
        count = result.count
        movies = result.rows
      }

      return res.json({
        success: true,
        data: movies,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / limit)
        },
        filters: {
          status,
          genre,
          language,
          platform_status,
          tenant_id
        },
        message: 'Movies retrieved successfully'
      })
    } catch (err) {
      console.error(`[SuperadminController]-[listMovies]: ${err.message}`)
      return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: err.message,
        message: 'Failed to retrieve movies'
      })
    }
  }

  static async getMovie(req, res) {
    try {
      const { id } = req.params
      const { include_relations = 'true' } = req.query

      const sequelize = req.db

      let movie
      if (include_relations === 'true') {
        movie = await getMovieWithAllRelations(sequelize, id)
      } else {
        const models = await syncAllMovieTables(sequelize)
        movie = await models.Movie.findByPk(id)
      }

      if (!movie) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({
          success: false,
          error: 'Movie not found',
          message: 'Movie retrieval failed'
        })
      }

      return res.json({
        success: true,
        data: movie,
        message: 'Movie retrieved successfully'
      })
    } catch (err) {
      console.error(`[SuperadminController]-[getMovie]: ${err.message}`)
      return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: err.message,
        message: 'Movie retrieval failed'
      })
    }
  }

  static async updateMovie(req, res) {
    try {
      const { id } = req.params
      const updateData = req.body

      const sequelize = req.db
      const models = await syncAllMovieTables(sequelize)

      const movie = await models.Movie.findByPk(id)

      if (!movie) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({
          success: false,
          error: 'Movie not found',
          message: 'Movie update failed'
        })
      }

      // Normalize optional city
      if (Object.prototype.hasOwnProperty.call(updateData, 'city')) {
        updateData.city = (updateData.city || '').trim() || null
      }

      // Update the movie with provided data
      await movie.update(updateData)

      // Return updated movie with relations if requested
      const updatedMovie = await getMovieWithAllRelations(sequelize, id)

      return res.json({
        success: true,
        data: updatedMovie,
        message: 'Movie updated successfully'
      })
    } catch (err) {
      console.error(`[SuperadminController]-[updateMovie]: ${err.message}`)
      return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: err.message,
        message: 'Movie update failed'
      })
    }
  }

  static async deleteMovie(req, res) {
    try {
      const { id } = req.params

      const sequelize = req.db
      const models = await syncAllMovieTables(sequelize)

      const movie = await models.Movie.findByPk(id)

      if (!movie) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({
          success: false,
          error: 'Movie not found',
          message: 'Movie deletion failed'
        })
      }

      // Cascade delete will handle related records automatically
      await movie.destroy()

      return res.json({
        success: true,
        message: 'Movie deleted successfully'
      })
    } catch (err) {
      console.error(`[SuperadminController]-[deleteMovie]: ${err.message}`)
      return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: err.message,
        message: 'Movie deletion failed'
      })
    }
  }

  // ==============================
  // MOVIE CAST MANAGEMENT
  // ==============================

  static async addMovieCast(req, res) {
    try {
      const { movieId } = req.params
      const { actor_id, character_name, character_description, role_type, display_order, is_featured, screen_time_minutes, character_image_url, character_type } = req.body

      if (!actor_id || !character_name || !role_type) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          error: 'actor_id, character_name, and role_type are required',
          message: 'Cast addition failed'
        })
      }

      const sequelize = req.db
      const models = await syncAllMovieTables(sequelize)

      // Verify movie exists
      const movie = await models.Movie.findByPk(movieId)
      if (!movie) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({
          success: false,
          error: 'Movie not found',
          message: 'Cast addition failed'
        })
      }

      // Verify actor exists
      const actor = await models.Actor.findByPk(actor_id)
      if (!actor) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({
          success: false,
          error: 'Actor not found',
          message: 'Cast addition failed'
        })
      }

      const castMember = await models.MovieCast.create({
        movie_id: movieId,
        actor_id,
        character_name,
        character_description,
        role_type,
        display_order: display_order || 0,
        is_featured: is_featured || false,
        screen_time_minutes,
        character_image_url,
        character_type,
        created_by: req.user?.id || 'system'
      })

      // Update actor's total movie count
      await actor.increment('total_movies')

      return res.status(HTTP_STATUS.CREATED).json({
        success: true,
        data: castMember,
        message: 'Cast member added successfully'
      })
    } catch (err) {
      console.error(`[SuperadminController]-[addMovieCast]: ${err.message}`)
      return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: err.message,
        message: 'Cast addition failed'
      })
    }
  }

  static async removeMovieCast(req, res) {
    try {
      const { movieId, castId } = req.params

      const sequelize = req.db
      const models = await syncAllMovieTables(sequelize)

      const castMember = await models.MovieCast.findOne({
        where: { id: castId, movie_id: movieId }
      })

      if (!castMember) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({
          success: false,
          error: 'Cast member not found',
          message: 'Cast removal failed'
        })
      }

      await castMember.destroy()

      return res.json({
        success: true,
        message: 'Cast member removed successfully'
      })
    } catch (err) {
      console.error(`[SuperadminController]-[removeMovieCast]: ${err.message}`)
      return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: err.message,
        message: 'Cast removal failed'
      })
    }
  }

  static async updateMovieCast(req, res) {
    try {
      const { movieId, castId } = req.params;
      const { actor_id, character_name, character_description, role_type, display_order, is_featured, screen_time_minutes, character_image_url, character_type } = req.body;

      const sequelize = req.db;
      const models = await syncAllMovieTables(sequelize);

      const castMember = await models.MovieCast.findOne({ where: { id: castId, movie_id: movieId } });
      if (!castMember) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({ success: false, error: 'Cast member not found', message: 'Cast update failed' });
      }

      // If actor_id provided, ensure actor exists
      if (actor_id) {
        const actor = await models.Actor.findByPk(actor_id);
        if (!actor) {
          return res.status(HTTP_STATUS.NOT_FOUND).json({ success: false, error: 'Actor not found', message: 'Cast update failed' });
        }
      }

      // Provide sensible defaults if missing
      const updates = {
        ...(actor_id ? { actor_id } : {}),
        character_name: character_name ?? castMember.character_name,
        character_description: character_description ?? castMember.character_description,
        role_type: role_type ?? castMember.role_type,
        display_order: display_order ?? castMember.display_order,
        is_featured: is_featured ?? castMember.is_featured,
        screen_time_minutes: screen_time_minutes ?? castMember.screen_time_minutes,
        character_image_url: character_image_url ?? castMember.character_image_url,
        character_type: character_type ?? castMember.character_type,
      };

      await castMember.update(updates);

      return res.json({ success: true, data: castMember, message: 'Cast member updated successfully' });
    } catch (err) {
      console.error(`[SuperadminController]-[updateMovieCast]: ${err.message}`);
      return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ success: false, error: err.message, message: 'Cast update failed' });
    }
  }

  // ==============================
  // MOVIE CREW MANAGEMENT
  // ==============================

  static async addMovieCrew(req, res) {
    try {
      const { movieId } = req.params
      const { person_id, role_category, role_title, custom_credit_text, is_primary, display_order, contribution_description, department } = req.body

      if (!person_id || !role_category || !role_title) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          error: 'person_id, role_category, and role_title are required',
          message: 'Crew addition failed'
        })
      }

      const sequelize = req.db
      const models = await syncAllMovieTables(sequelize)

      // Verify movie exists
      const movie = await models.Movie.findByPk(movieId)
      if (!movie) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({
          success: false,
          error: 'Movie not found',
          message: 'Crew addition failed'
        })
      }

      // Verify crew person exists
      const person = await models.CrewPerson.findByPk(person_id)
      if (!person) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({
          success: false,
          error: 'Crew person not found',
          message: 'Crew addition failed'
        })
      }

      const crewMember = await models.MovieCrew.create({
        movie_id: movieId,
        person_id,
        role_category,
        role_title,
        custom_credit_text,
        is_primary: is_primary || false,
        display_order: display_order || 0,
        contribution_description,
        department,
        created_by: req.user?.id || 'system'
      })

      // Update person's total credits count
      await person.increment('total_credits')

      return res.status(HTTP_STATUS.CREATED).json({
        success: true,
        data: crewMember,
        message: 'Crew member added successfully'
      })
    } catch (err) {
      console.error(`[SuperadminController]-[addMovieCrew]: ${err.message}`)
      return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: err.message,
        message: 'Crew addition failed'
      })
    }
  }

  static async removeMovieCrew(req, res) {
    try {
      const { movieId, crewId } = req.params;

      const sequelize = req.db;
      const models = await syncAllMovieTables(sequelize);

      const crewMember = await models.MovieCrew.findOne({ where: { id: crewId, movie_id: movieId } });
      if (!crewMember) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({ success: false, error: 'Crew member not found', message: 'Crew removal failed' });
      }

      await crewMember.destroy();

      return res.json({ success: true, message: 'Crew member removed successfully' });
    } catch (err) {
      console.error(`[SuperadminController]-[removeMovieCrew]: ${err.message}`);
      return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ success: false, error: err.message, message: 'Crew removal failed' });
    }
  }

  static async updateMovieCrew(req, res) {
    try {
      const { movieId, crewId } = req.params;
      const { person_id, role_category, role_title, custom_credit_text, is_primary, display_order, contribution_description, department } = req.body;

      const sequelize = req.db;
      const models = await syncAllMovieTables(sequelize);

      const crewMember = await models.MovieCrew.findOne({ where: { id: crewId, movie_id: movieId } });
      if (!crewMember) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({ success: false, error: 'Crew member not found', message: 'Crew update failed' });
      }

      if (person_id) {
        const person = await models.CrewPerson.findByPk(person_id);
        if (!person) {
          return res.status(HTTP_STATUS.NOT_FOUND).json({ success: false, error: 'Crew person not found', message: 'Crew update failed' });
        }
      }

      const updates = {
        ...(person_id ? { person_id } : {}),
        role_category: role_category ?? crewMember.role_category,
        role_title: role_title ?? crewMember.role_title,
        custom_credit_text: custom_credit_text ?? crewMember.custom_credit_text,
        is_primary: is_primary ?? crewMember.is_primary,
        display_order: display_order ?? crewMember.display_order,
        contribution_description: contribution_description ?? crewMember.contribution_description,
        department: department ?? crewMember.department,
      };

      await crewMember.update(updates);

      return res.json({ success: true, data: crewMember, message: 'Crew member updated successfully' });
    } catch (err) {
      console.error(`[SuperadminController]-[updateMovieCrew]: ${err.message}`);
      return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ success: false, error: err.message, message: 'Crew update failed' });
    }
  }

  // ==============================
  // MOVIE REVIEWS MANAGEMENT
  // ==============================

  static async addMovieReview(req, res) {
    try {
      const { movieId } = req.params
      const reviewData = req.body

      if (!reviewData.reviewer_name || !reviewData.review_quote || !reviewData.review_type) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          error: 'reviewer_name, review_quote, and review_type are required',
          message: 'Review addition failed'
        })
      }

      const sequelize = req.db
      const models = await syncAllMovieTables(sequelize)

      // Verify movie exists
      const movie = await models.Movie.findByPk(movieId)
      if (!movie) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({
          success: false,
          error: 'Movie not found',
          message: 'Review addition failed'
        })
      }

      const review = await models.MovieReview.create({
        movie_id: movieId,
        ...reviewData,
        review_date: reviewData.review_date || new Date(),
        created_by: req.user?.id || 'system'
      })

      return res.status(HTTP_STATUS.CREATED).json({
        success: true,
        data: review,
        message: 'Review added successfully'
      })
    } catch (err) {
      console.error(`[SuperadminController]-[addMovieReview]: ${err.message}`)
      return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: err.message,
        message: 'Review addition failed'
      })
    }
  }

  // ==============================
  // BULK OPERATIONS
  // ==============================

  static async bulkUpdateMovieStatus(req, res) {
    try {
      const { movieIds, status, platform_status } = req.body

      if (!movieIds?.length) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          error: 'movieIds array is required',
          message: 'Bulk update failed'
        })
      }

      const sequelize = req.db
      const models = await syncAllMovieTables(sequelize)

      const updateData = {}
      if (status !== undefined) updateData.is_active = status
      if (platform_status) updateData.platform_status = platform_status

      const [updatedCount] = await models.Movie.update(updateData, {
        where: {
          id: {
            [sequelize.Sequelize.Op.in]: movieIds
          }
        }
      })

      return res.json({
        success: true,
        data: { updatedCount },
        message: `${updatedCount} movies updated successfully`
      })
    } catch (err) {
      console.error(`[SuperadminController]-[bulkUpdateMovieStatus]: ${err.message}`)
      return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: err.message,
        message: 'Bulk update failed'
      })
    }
  }

  // ==============================
  // ACTOR MANAGEMENT
  // ==============================

  static async createActor(req, res) {
    try {
      const { name, bio, profile_image_url } = req.body;

      if (!name || !name.trim()) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({ success: false, error: 'Name is required', message: 'Actor creation failed' });
      }

      const sequelize = req.db;
      const models = await syncAllMovieTables(sequelize);

      const actor = await models.Actor.create({
        name: name.trim(),
        bio,
        profile_image_url
      });

      return res.json({ success: true, data: actor, message: 'Actor created successfully' });
    } catch (err) {
      console.error(`[SuperadminController]-[createActor]: ${err.message}`);
      return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ success: false, error: err.message, message: 'Actor creation failed' });
    }
  }

  static async listActors(req, res) {
    try {
      const { page = 1, limit = 10, search, nationality, verified } = req.query;

      const sequelize = req.db;
      const models = await syncAllMovieTables(sequelize);

      const where = {};
      if (search) where.name = { [Op.iLike]: `%${search}%` };
      if (nationality) where.nationality = nationality;
      if (verified !== undefined) where.verified = verified === 'true';

      const { rows: data, count: total } = await models.Actor.findAndCountAll({
        where,
        limit: parseInt(limit),
        offset: (page - 1) * limit,
        order: [['name', 'ASC']]
      });

      return res.json({ success: true, data: { data, pagination: { total, page: parseInt(page), limit: parseInt(limit), totalPages: Math.ceil(total / limit) } }, message: 'Actors retrieved successfully' });
    } catch (err) {
      console.error(`[SuperadminController]-[listActors]: ${err.message}`);
      return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ success: false, error: err.message, message: 'Actors retrieval failed' });
    }
  }

  // ==============================
  // CREW PERSON MANAGEMENT
  // ==============================

  static async createCrewPerson(req, res) {
    try {
      const { name, bio, specialty, profile_image_url } = req.body;

      if (!name || !name.trim()) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({ success: false, error: 'Name is required', message: 'Crew person creation failed' });
      }

      const sequelize = req.db;
      const models = await syncAllMovieTables(sequelize);

      const crewPerson = await models.CrewPerson.create({
        name: name.trim(),
        bio,
        specialty,
        profile_image_url
      });

      return res.json({ success: true, data: crewPerson, message: 'Crew person created successfully' });
    } catch (err) {
      console.error(`[SuperadminController]-[createCrewPerson]: ${err.message}`);
      return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ success: false, error: err.message, message: 'Crew person creation failed' });
    }
  }

  static async updateCrewPerson(req, res) {
    try {
      const { id } = req.params;
      const { name, bio, specialty, profile_image_url } = req.body;

      if (!name || !name.trim()) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({ success: false, error: 'Name is required', message: 'Crew person update failed' });
      }

      const sequelize = req.db;
      const models = await syncAllMovieTables(sequelize);

      const crewPerson = await models.CrewPerson.findByPk(id);
      if (!crewPerson) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({ success: false, error: 'Crew person not found', message: 'Crew person update failed' });
      }

      await crewPerson.update({
        name: name.trim(),
        bio,
        specialty,
        profile_image_url
      });

      return res.json({ success: true, data: crewPerson, message: 'Crew person updated successfully' });
    } catch (err) {
      console.error(`[SuperadminController]-[updateCrewPerson]: ${err.message}`);
      return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ success: false, error: err.message, message: 'Crew person update failed' });
    }
  }

  static async listCrewPersons(req, res) {
    try {
      const { page = 1, limit = 10, search, specialty, verified } = req.query;

      const sequelize = req.db;
      const models = await syncAllMovieTables(sequelize);

      const where = {};
      if (search) where.name = { [Op.iLike]: `%${search}%` };
      if (specialty) where.specialty = specialty;
      if (verified !== undefined) where.verified = verified === 'true';

      const { rows: data, count: total } = await models.CrewPerson.findAndCountAll({
        where,
        limit: parseInt(limit),
        offset: (page - 1) * limit,
        order: [['name', 'ASC']]
      });

      return res.json({ success: true, data: { data, pagination: { total, page: parseInt(page), limit: parseInt(limit), totalPages: Math.ceil(total / limit) } }, message: 'Crew persons retrieved successfully' });
    } catch (err) {
      console.error(`[SuperadminController]-[listCrewPersons]: ${err.message}`);
      return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ success: false, error: err.message, message: 'Crew persons retrieval failed' });
    }
  }

  // ==============================
  // BOOKING MANAGEMENT
  // ==============================

  static async getAllBookings(req, res) {
    try {
      const { status, search, page = 1, limit = 50 } = req.query
      
      // Use centralized models with pre-configured associations
      const { Booking, Show, Movie, Auditorium, Theatre, BookedSeat, Seat } = req.models

      // Build where clause - superadmin can see all tenants
      let whereClause = {}

      // Add status filter
      if (status && status !== 'all') {
        whereClause.status = status
      }

      // Add search filter
      if (search) {
        whereClause[Op.or] = [
          { booking_reference: { [Op.iLike]: `%${search}%` } },
          { customer_name: { [Op.iLike]: `%${search}%` } },
          { customer_phone: { [Op.iLike]: `%${search}%` } },
          { customer_email: { [Op.iLike]: `%${search}%` } }
        ]
      }

      // Calculate pagination
      const offset = (parseInt(page) - 1) * parseInt(limit)

      // Get bookings with related data
      const { count, rows: bookings } = await Booking.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: Show,
            as: 'Show',
            include: [
              {
                model: Movie,
                as: 'Movie'
              },
              {
                model: Auditorium,
                as: 'Auditorium',
                include: [
                  {
                    model: Theatre,
                    as: 'Theatre'
                  }
                ]
              }
            ]
          }
        ],
        order: [['createdAt', 'DESC']],
        limit: parseInt(limit),
        offset: offset
      })

      // Get seat details for each booking
      const bookingsWithSeats = await Promise.all(
        bookings.map(async (booking) => {
          let seats = []
          
          // For public reservations (pending status), use requested_seats from booking
          if (booking.status === 'pending' && booking.requested_seats) {
            seats = booking.requested_seats.map(seat => ({
              row: seat.row || 'Unknown',
              number: seat.number || 0,
              category: seat.category || 'Unknown',
              price: seat.price || 0
            }))
          } else {
            // For confirmed bookings, get seats from BookedSeat table
            const bookedSeats = await BookedSeat.findAll({
              where: { booking_id: booking.id },
              include: [
                {
                  model: Seat
                }
              ]
            })
            
            seats = bookedSeats.map(bs => ({
              row: bs.Seat?.row || 'Unknown',
              number: bs.Seat?.number || 0,
              category: bs.Seat?.category || 'Unknown',
              price: bs.price_paid || 0
            }))
          }

          return {
            id: booking.id,
            booking_reference: booking.booking_reference,
            customer_name: booking.customer_name,
            customer_phone: booking.customer_phone,
            customer_email: booking.customer_email,
            movie_title: booking.Show?.Movie?.title || 'Unknown Movie',
            show_date: booking.Show?.show_datetime ? booking.Show.show_datetime.toISOString().split('T')[0] : 'Unknown Date',
            show_time: booking.Show?.show_datetime ? booking.Show.show_datetime.toTimeString().split(' ')[0].substring(0, 5) : 'Unknown Time',
            venue_name: booking.Show?.Auditorium?.Theatre?.name || 'Unknown Venue',
            screen_name: booking.Show?.Auditorium?.name || 'Unknown Screen',
            seats: seats,
            total_price: booking.total_price || 0,
            booking_status: booking.status || 'unknown',
            created_at: booking.createdAt
          }
        })
      )

      return res.json({
        success: true,
        data: {
          bookings: bookingsWithSeats,
          pagination: {
            total: count,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(count / parseInt(limit))
          }
        },
        message: 'Bookings retrieved successfully'
      })
    } catch (err) {
      console.error(`[SuperadminController]-[getAllBookings]: ${err.message}`)
      return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: err.message,
        message: 'Failed to retrieve bookings'
      })
    }
  }
}
