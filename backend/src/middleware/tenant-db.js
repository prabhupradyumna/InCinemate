import { sequelize } from '../db.js'
import { createTenantResolver } from '../tenant-resolver.js'

const tenantResolver = createTenantResolver({
  strategy: process.env.TENANT_RESOLUTION || 'host',
  header: process.env.TENANT_HEADER || 'x-tenant-id',
})

export function attachTenantDb() {
  return function tenantDbMiddleware(req, _res, next) {
    const tenantId = tenantResolver(req)
    req.tenantId = tenantId || null
    req.db = sequelize
    next()
  }
}
