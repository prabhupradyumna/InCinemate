import { Router } from 'express'
import { defineShow } from '../models/Show.js'
import { authenticate, authorizeRoles } from '../middleware/auth.middleware.js'

export function createShowsRouter() {
  const router = Router()

  // All show routes require authentication
  router.use(authenticate)

  // GET /shows - accessible by all authenticated users (public viewing)
  router.get('/', authorizeRoles('admin', 'super_admin', 'customer', 'ticket_checker'), async (req, res) => {
    const { Show, Movie, Auditorium, Theatre, Tenant } = req.models

    // If we have a tenant UUID, look up the tenant to get the tenant_id string for filtering
    let where = undefined
    if (req.tenantId) {
      try {
        const tenant = await Tenant.findByPk(req.tenantId)
        if (tenant) {
          where = { tenant_id: tenant.tenant_id }
        }
      } catch (error) {
        console.error('Error looking up tenant for shows filtering:', error)
      }
    }

    console.log('🎭 Loading shows with filter:', { tenantId: req.tenantId, where })

    // Include related models to get movie, auditorium, and theatre data
    const shows = await Show.findAll({
      where,
      order: [['show_datetime', 'ASC']],
      include: [
        {
          model: Movie,
          as: 'Movie',
          attributes: ['id', 'title', 'poster_url']
        },
        {
          model: Auditorium,
          as: 'Auditorium',
          attributes: ['id', 'name', 'total_seats'],
          include: [
            {
              model: Theatre,
              as: 'Theatre',
              attributes: ['id', 'name', 'city']
            }
          ]
        }
      ]
    })
    res.json(shows)
  })

  // POST /shows - only admin and super_admin can create shows
  router.post('/', authorizeRoles('admin', 'super_admin'), async (req, res) => {
    const sequelize = req.db
    const Show = defineShow(sequelize)
    await Show.sync()

    // Get tenant_id from either request body or middleware
    const tenantIdFromBody = req.body.tenant_id
    const tenantIdFromMiddleware = req.tenantId

    console.log('🎭 Request data:', {
      body: req.body,
      tenantIdFromBody,
      tenantIdFromMiddleware,
      user: req.user?.userId
    })

    // Find the selected tenant to get the tenant_id string for storage
    const { defineTenant } = await import('../models/Tenant.js')
    const Tenant = defineTenant(sequelize)

    // Determine which tenant ID to use for lookup
    const lookupTenantId = tenantIdFromBody || tenantIdFromMiddleware

    // Get the tenant data using the UUID, then extract the tenant_id string
    let tenantData = null
    let actualTenantId = lookupTenantId

    if (lookupTenantId) {
      try {
        tenantData = await Tenant.findByPk(lookupTenantId)
        actualTenantId = tenantData?.tenant_id || lookupTenantId
      } catch (error) {
        console.error('Error looking up tenant for show creation:', error)
      }
    }

    console.log('🎭 Tenant lookup:', {
      searchId: lookupTenantId,
      tenantData,
      actualTenantId
    })

    const payload = {
      ...req.body,
      tenant_id: actualTenantId, // Use the tenant_id string for storage
      created_by: req.user.userId
    }

    console.log('🎭 Creating show with payload:', payload)

    const show = await Show.create(payload)
    res.status(201).json(show)
  })

  // DELETE /shows/:id - Delete a show (admin/super_admin only)
  router.delete('/:id', authorizeRoles('admin', 'super_admin'), async (req, res) => {
    const sequelize = req.db
    const Show = defineShow(sequelize)
    await Show.sync()

    const { id } = req.params

    try {
      const show = await Show.findByPk(id)
      if (!show) {
        return res.status(404).json({
          success: false,
          error: 'Show not found'
        })
      }

      // Check if user has permission to delete this show
      if (req.user.role !== 'super_admin' && show.tenant_id !== req.user.tenantId) {
        return res.status(403).json({
          success: false,
          error: 'Insufficient permissions to delete this show'
        })
      }

      await show.destroy()
      
      res.json({
        success: true,
        message: 'Show deleted successfully'
      })
    } catch (error) {
      console.error('Error deleting show:', error)
      res.status(500).json({
        success: false,
        error: error.message
      })
    }
  })

  return router
}
