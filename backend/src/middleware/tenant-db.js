import { sequelize } from '../db.js'
import { createTenantResolver } from '../tenant-resolver.js'
import { getModelManager } from '../models/index.js'

const tenantResolver = createTenantResolver({
  strategy: process.env.TENANT_RESOLUTION || 'host',
  header: process.env.TENANT_HEADER || 'x-tenant-id',
})

const modelManager = getModelManager(sequelize)

export function attachTenantDb() {
  return function tenantDbMiddleware(req, _res, next) {
    const tenantId = tenantResolver(req)
    req.tenantId = tenantId || null
    req.db = sequelize
    req.models = modelManager.getModels()
    next()
  }
}
