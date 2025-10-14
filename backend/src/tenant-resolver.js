import { sequelize } from './db.js'
import { defineTenant } from './models/Tenant.js'

export function createTenantResolver({ strategy, header }) {
  return async function resolveTenant(req) {
    console.log('[TenantResolver] Strategy:', strategy);
    console.log('[TenantResolver] Hostname:', req.hostname);
    
    if (strategy === 'header') {
      const tenantId = req.get(header);
      console.log('[TenantResolver] Header strategy, tenant ID:', tenantId);
      return tenantId;
    }
    if (strategy === 'param') {
      const tenantId = req.params?.tenant;
      console.log('[TenantResolver] Param strategy, tenant ID:', tenantId);
      return tenantId;
    }

    const host = req.hostname || ''
    const [sub] = host.split('.')
    const tenantIdentifier = sub && sub !== 'www' ? sub : null

    console.log('[TenantResolver] Host strategy, identifier:', tenantIdentifier);

    // For localhost development, return a default tenant ID
    if (!tenantIdentifier || host === 'localhost') {
      console.log('[TenantResolver] Using default tenant for localhost');
      // Look up the default development tenant by tenant_id string
      try {
        const Tenant = defineTenant(sequelize)
        const defaultTenant = await Tenant.findOne({
          where: { tenant_id: 'client1' }
        })
        if (defaultTenant) {
          console.log('[TenantResolver] Found default tenant:', defaultTenant.id);
          return defaultTenant.id // Return the UUID for database operations
        }
      } catch (error) {
        console.error('[TenantResolver] Error finding default tenant:', error)
      }
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
        console.log('[TenantResolver] Found tenant:', tenant.id);
        return tenant.id
      }

      console.log('[TenantResolver] Tenant not found, returning null');
      return null
    } catch (error) {
      console.error('[TenantResolver] Error:', error)
      return null
    }
  }
}
