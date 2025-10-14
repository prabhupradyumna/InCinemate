import { sequelize } from '../db.js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

/**
 * Setup database by running the SQL migration script
 */
async function setupDatabase() {
  try {
    console.log('🔄 Setting up database...')
    
    // Read the SQL migration script
    const sqlPath = path.join(__dirname, '../../../frontend/scripts/01-create-tables.sql')
    const sqlContent = fs.readFileSync(sqlPath, 'utf8')
    
    console.log('📝 Running SQL migration script...')
    
    // Split the SQL content by semicolons and execute each statement
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'))
    
    for (const statement of statements) {
      if (statement.trim()) {
        try {
          await sequelize.query(statement)
          console.log('✅ Executed:', statement.substring(0, 50) + '...')
        } catch (error) {
          // Ignore errors for tables that already exist
          if (error.message.includes('already exists')) {
            console.log('⚠️  Table already exists, skipping...')
          } else {
            console.error('❌ Error executing statement:', error.message)
            console.error('Statement:', statement.substring(0, 100) + '...')
          }
        }
      }
    }
    
    // Verify tables were created
    const [tables] = await sequelize.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `)
    
    console.log('📋 Created tables:')
    tables.forEach(table => {
      console.log(`  - ${table.table_name}`)
    })
    
    // Insert some sample data for testing
    console.log('🌱 Inserting sample data...')
    
    // Insert sample movies
    await sequelize.query(`
      INSERT INTO movies (id, title, description, genre, duration_minutes, rating, release_date, poster_url, trailer_url, language, is_active)
      VALUES 
        (gen_random_uuid(), 'The Dark Knight', 'Batman faces the Joker in this epic superhero film', 'Action', 152, 'PG-13', '2008-07-18', '/posters/dark-knight.jpg', '/trailers/dark-knight.mp4', 'English', true),
        (gen_random_uuid(), 'Inception', 'A mind-bending thriller about dreams within dreams', 'Sci-Fi', 148, 'PG-13', '2010-07-16', '/posters/inception.jpg', '/trailers/inception.mp4', 'English', true),
        (gen_random_uuid(), 'Interstellar', 'A space epic about saving humanity', 'Sci-Fi', 169, 'PG-13', '2014-11-07', '/posters/interstellar.jpg', '/trailers/interstellar.mp4', 'English', true)
      ON CONFLICT DO NOTHING
    `)
    
    // Insert sample venues
    await sequelize.query(`
      INSERT INTO venues (id, name, address, city, state, zip_code, phone, email, is_active)
      VALUES 
        (gen_random_uuid(), 'Downtown Cinema', '123 Main Street', 'Mumbai', 'Maharashtra', '400001', '+91-22-12345678', 'info@downtowncinema.com', true),
        (gen_random_uuid(), 'Mall Multiplex', '456 Shopping Mall', 'Mumbai', 'Maharashtra', '400002', '+91-22-87654321', 'info@mallmultiplex.com', true)
      ON CONFLICT DO NOTHING
    `)
    
    // Insert sample screens
    await sequelize.query(`
      INSERT INTO screens (id, venue_id, name, total_seats, seat_map, is_active)
      SELECT 
        gen_random_uuid(),
        v.id,
        'Screen ' || generate_series(1, 3),
        100,
        '{"rows": 10, "seats_per_row": 10}',
        true
      FROM venues v
      ON CONFLICT DO NOTHING
    `)
    
    // Insert sample shows
    await sequelize.query(`
      INSERT INTO shows (id, movie_id, screen_id, venue_id, show_date, show_time, base_price, pricing_tiers, is_active)
      SELECT 
        gen_random_uuid(),
        m.id,
        s.id,
        v.id,
        CURRENT_DATE + INTERVAL '1 day',
        '19:00:00',
        250.00,
        '{"vip": 1000, "diamond": 800, "platinum": 600, "gold": 400, "silver": 250}',
        true
      FROM movies m
      CROSS JOIN screens s
      CROSS JOIN venues v
      WHERE s.venue_id = v.id
      ON CONFLICT DO NOTHING
    `)
    
    console.log('✅ Sample data inserted successfully!')
    console.log('🎉 Database setup completed!')
    
  } catch (error) {
    console.error('❌ Database setup failed:', error)
    throw error
  }
}

// Run setup if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  setupDatabase()
    .then(() => {
      console.log('✅ Database setup completed')
      process.exit(0)
    })
    .catch((error) => {
      console.error('❌ Database setup failed:', error)
      process.exit(1)
    })
}

export { setupDatabase }


