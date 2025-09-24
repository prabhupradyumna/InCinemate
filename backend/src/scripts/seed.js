import 'dotenv/config'
import { sequelize } from '../db.js'
import { defineUser } from '../models/User.js'
import { defineTenant } from '../models/Tenant.js'
import { hashPassword } from '../util/auth.util.js'

async function seed() {
  try {
    console.log('🌱 Starting seed...')
    
    // Sync models
    const User = defineUser(sequelize)
    const Tenant = defineTenant(sequelize)
    await Promise.all([User.sync(), Tenant.sync()])
    
    // Create super admin
    const superAdminExists = await User.findOne({ where: { role: 'super_admin' } })
    if (!superAdminExists) {
      const hashedPassword = await hashPassword('admin123')
      await User.create({
        email: 'superadmin@inflow.com',
        password_hash: hashedPassword,
        role: 'super_admin',
        full_name: 'Super Administrator',
        phone: '+1234567890',
      })
      console.log('✅ Super admin created: superadmin@inflow.com / admin123')
    } else {
      console.log('ℹ️  Super admin already exists')
    }
    
    // Create sample tenant
    const tenantExists = await Tenant.findOne({ where: { tenant_id: 'acme' } })
    if (!tenantExists) {
      await Tenant.create({
        tenant_id: 'acme',
        name: 'ACME Cinema Chain',
        owner_name: 'John Doe',
        email: 'admin@acme.com',
        phone: '+1234567891',
        address: '123 Main St',
        city: 'New York',
        state: 'NY',
        country: 'USA',
        postal_code: '10001',
      })
      console.log('✅ Tenant created: acme')
    } else {
      console.log('ℹ️  Tenant acme already exists')
    }
    
    // Create sample admin for acme tenant (email can be anything)
    const adminExists = await User.findOne({ where: { email: 'admin@acme.com' } })
    if (!adminExists) {
      const hashedPassword = await hashPassword('admin123')
      await User.create({
        email: 'admin@acme.com',
        password_hash: hashedPassword,
        role: 'admin',
        tenant_id: 'acme',
        full_name: 'ACME Admin',
        phone: '+1234567891',
      })
      console.log('✅ Admin created: admin@acme.com / admin123 (tenant: acme)')
    } else {
      console.log('ℹ️  Admin for acme already exists')
    }
    
    console.log('🎉 Seed completed successfully!')
    console.log('\n📋 Login Credentials:')
    console.log('Super Admin: superadmin@inflow.com / admin123')
    console.log('ACME Admin: admin@acme.com / admin123 (tenant: acme)')
    
  } catch (error) {
    console.error('❌ Seed failed:', error)
  } finally {
    await sequelize.close()
  }
}

seed()
