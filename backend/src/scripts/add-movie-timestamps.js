import { sequelize } from '../db.js'

async function addTimestampsToMovies() {
  try {
    console.log('🔧 Adding timestamp columns to movies table...')
    
    // Add created_at column if it doesn't exist
    await sequelize.query(`
      DO $$ 
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                      WHERE table_name = 'movies' AND column_name = 'created_at') THEN
          ALTER TABLE movies ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
        END IF;
      END $$;
    `)
    console.log('✅ created_at column added/verified')

    // Add updated_at column if it doesn't exist
    await sequelize.query(`
      DO $$ 
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                      WHERE table_name = 'movies' AND column_name = 'updated_at') THEN
          ALTER TABLE movies ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
        END IF;
      END $$;
    `)
    console.log('✅ updated_at column added/verified')

    // Update existing records to have timestamps if they don't
    await sequelize.query(`
      UPDATE movies 
      SET created_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP 
      WHERE created_at IS NULL OR updated_at IS NULL;
    `)
    console.log('✅ Existing records updated with timestamps')

    // Create index on created_at for better performance
    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_movies_created_at ON movies (created_at);
    `)
    console.log('✅ Index on created_at created')

    console.log('🎉 Movie table timestamp migration completed successfully!')
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message)
    throw error
  }
}

// Run the migration
addTimestampsToMovies()
  .then(() => {
    console.log('Migration completed')
    process.exit(0)
  })
  .catch((error) => {
    console.error('Migration failed:', error)
    process.exit(1)
  })