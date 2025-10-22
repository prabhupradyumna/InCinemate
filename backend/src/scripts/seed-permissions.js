import dotenv from 'dotenv'
dotenv.config()

import { setupAssociations } from '../models/associations.js'
import { sequelize } from '../db.js'

const DEFAULT_PERMISSIONS = [
  // Movie Management
  { name: 'manage_movies', description: 'Create, edit, and delete movies', category: 'movies' },
  { name: 'view_movies', description: 'View movie library and details', category: 'movies' },
  
  // Show Management
  { name: 'manage_shows', description: 'Schedule and manage movie shows', category: 'shows' },
  { name: 'view_shows', description: 'View show schedules and details', category: 'shows' },
  
  // Pricing Management
  { name: 'set_pricing', description: 'Set dynamic pricing for shows and seats', category: 'pricing' },
  { name: 'view_pricing', description: 'View pricing information', category: 'pricing' },
  
  // Coupon Management
  { name: 'manage_coupons', description: 'Create and manage promotional coupons', category: 'coupons' },
  { name: 'view_coupons', description: 'View coupon usage and statistics', category: 'coupons' },
  
  // Reports & Analytics
  { name: 'view_reports', description: 'Access sales reports and analytics', category: 'reports' },
  { name: 'export_data', description: 'Export booking and sales data', category: 'reports' },
  
  // Live Operations
  { name: 'view_live_operations', description: 'Monitor live bookings and seat status', category: 'operations' },
  { name: 'manage_staff', description: 'Create and manage ticket checker accounts', category: 'operations' },
  
  // Auditorium Management
  { name: 'request_auditoriums', description: 'Submit auditorium configuration requests', category: 'auditoriums' },
  { name: 'view_auditoriums', description: 'View available auditoriums and seating', category: 'auditoriums' },
]

async function seedPermissions() {
  try {
    console.log('🌱 Starting permission seeding...')
    
    // Setup models and associations
    const { Permission } = setupAssociations(sequelize)
    
    // Sync the Permission model
    await Permission.sync({ force: false })
    
    // Create permissions
    for (const permissionData of DEFAULT_PERMISSIONS) {
      const [permission, created] = await Permission.findOrCreate({
        where: { name: permissionData.name },
        defaults: permissionData
      })
      
      if (created) {
        console.log(`✅ Created permission: ${permission.name}`)
      } else {
        console.log(`⏭️  Permission already exists: ${permission.name}`)
      }
    }
    
    console.log('🎉 Permission seeding completed successfully!')
    
    // List all permissions
    const allPermissions = await Permission.findAll({
      order: [['category', 'ASC'], ['name', 'ASC']]
    })
    
    console.log('\n📋 All permissions:')
    allPermissions.forEach(permission => {
      console.log(`  - ${permission.name} (${permission.category}): ${permission.description}`)
    })
    
  } catch (error) {
    console.error('❌ Error seeding permissions:', error)
    throw error
  }
}

// Run if called directly
if (process.argv[1] && process.argv[1].endsWith('seed-permissions.js')) {
  seedPermissions()
    .then(() => {
      console.log('✅ Permission seeding completed')
      process.exit(0)
    })
    .catch((error) => {
      console.error('❌ Permission seeding failed:', error)
      process.exit(1)
    })
}

export { seedPermissions, DEFAULT_PERMISSIONS }
