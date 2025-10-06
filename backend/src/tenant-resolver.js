import { sequelize } from './db.js'
import { defineTenant } from './models/Tenant.js'

export function createTenantResolver({ strategy, header }) {
  return async function resolveTenant(req) {
    if (strategy === 'header') {
      return req.get(header)
    }
    if (strategy === 'param') {
      return req.params?.tenant
    }

    const host = req.hostname || ''
    const [sub] = host.split('.')
    const tenantIdentifier = sub && sub !== 'www' ? sub : null

    if (!tenantIdentifier) {
      return null
    }

    try {
      // Look up the tenant by tenant_id field (string) to get the UUID
      const Tenant = defineTenant(sequelize)
      const tenant = await Tenant.findOne({
        where: { tenant_id: tenantIdentifier }
      })

      if (tenant) {
        // Return the UUID (id field) for database operations
        return tenant.id
      }

      return null
    } catch (error) {
      console.error('Tenant resolution error:', error)
      return null
    }
  }
}
