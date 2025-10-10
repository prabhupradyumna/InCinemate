import { sequelize } from '../db.js'
import { createTenantResolver } from '../tenant-resolver.js'
import { getModelManager } from '../models/index.js'

const tenantResolver = createTenantResolver({
  strategy: process.env.TENANT_RESOLUTION || 'host',
  header: process.env.TENANT_HEADER || 'x-tenant-id',
})

const modelManager = getModelManager(sequelize)

export function attachTenantDb() {
  return async function tenantDbMiddleware(req, _res, next) {
    try {
      console.log('[TenantDB] Processing request:', req.url);
      console.log('[TenantDB] Hostname:', req.hostname);
      
      // Simplified tenant resolution for development
      let tenantId = 'test-tenant-id'; // Default for localhost
      
      // Try to resolve tenant but don't hang on database queries
      try {
        const resolvedTenantId = await Promise.race([
          tenantResolver(req),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Tenant resolution timeout')), 5000))
        ]);
        tenantId = resolvedTenantId || tenantId;
      } catch (error) {
        console.log('[TenantDB] Tenant resolution failed, using default:', error.message);
      }
      
      console.log('[TenantDB] Using tenant ID:', tenantId);
      
      req.tenantId = tenantId
      req.db = sequelize
      
      console.log('[TenantDB] Getting models...');
      
      // Check if ModelManager is initialized
      if (!modelManager.isInitialized) {
        console.log('[TenantDB] ModelManager not initialized, initializing...');
        await modelManager.initialize();
      }
      
      req.models = modelManager.getModels()
      console.log('[TenantDB] Models retrieved:', Object.keys(req.models));
      
      console.log('[TenantDB] Middleware completed successfully');
      next()
    } catch (error) {
      console.error('[TenantDB] Middleware error:', error)
      next(error)
    }
  }
}
