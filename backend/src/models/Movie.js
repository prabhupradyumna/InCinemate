import { DataTypes } from 'sequelize'

export function defineMovie(sequelize) {
  return sequelize.define(
    'Movie',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      poster_url: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      trailer_url: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      synopsis: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Brief summary/description of the movie plot'
      },
      // Enhanced Media Assets
      backdrop_url: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'Landscape banner image URL (1920x1080px)'
      },
      additional_trailers: {
        type: DataTypes.JSONB,
        allowNull: true,
        defaultValue: [],
        comment: 'Array of additional trailer URLs'
      },
      photo_gallery: {
        type: DataTypes.JSONB,
        allowNull: true,
        defaultValue: [],
        comment: 'Array of movie stills and BTS photos'
      },
      
      // Enhanced Content Details
      short_description: {
        type: DataTypes.STRING(150),
        allowNull: true,
        comment: 'Short description for cards (max 150 chars)'
      },
      tagline: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'Catchy tagline displayed on poster'
      },
      genres: {
        type: DataTypes.JSONB,
        allowNull: true,
        defaultValue: [],
        comment: 'Array of genres: ["Action", "Drama", "Thriller"]'
      },
      sub_genres: {
        type: DataTypes.JSONB,
        allowNull: true,
        defaultValue: [],
        comment: 'Additional tags: ["Superhero", "Period", "Social"]'
      },
      duration_minutes: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'Movie duration in minutes'
      },
      release_date: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      rating: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'CBFC rating (U, UA, U/A 7+, U/A 13+, U/A 16+, A, S)'
      },
      cbfc_certificate: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'CBFC Certificate Number'
      },
      content_advisories: {
        type: DataTypes.JSONB,
        allowNull: true,
        defaultValue: [],
        comment: 'Content warnings: ["Violence", "Language", "Sexual Content"]'
      },
      
      // Languages & Formats
      languages: {
        type: DataTypes.JSONB,
        allowNull: false,
        defaultValue: ['English'],
        comment: 'Available languages: ["Hindi", "English", "Tamil"]'
      },
      subtitle_languages: {
        type: DataTypes.JSONB,
        allowNull: true,
        defaultValue: [],
        comment: 'Available subtitle languages'
      },
      formats: {
        type: DataTypes.JSONB,
        allowNull: false,
        defaultValue: ['2D'],
        comment: 'Available formats: ["2D", "3D", "IMAX", "4DX"]'
      },
      countries: {
        type: DataTypes.JSONB,
        allowNull: false,
        defaultValue: ['India'],
        comment: 'Release countries: ["India", "United States", "United Kingdom"]'
      },
      // Primary release city for discovery filtering
      city: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'Primary city used for discovery filtering'
      },
      
      // External Ratings (Optional)
      imdb_rating: {
        type: DataTypes.DECIMAL(3, 1),
        allowNull: true,
        comment: 'IMDb rating out of 10'
      },
      rotten_tomatoes: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'Rotten Tomatoes percentage'
      },
      metacritic_score: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'Metacritic score out of 100'
      },
      
      // Production Details
      production_houses: {
        type: DataTypes.JSONB,
        allowNull: true,
        defaultValue: [],
        comment: 'Array of production house names'
      },
      distributors: {
        type: DataTypes.JSONB,
        allowNull: true,
        defaultValue: [],
        comment: 'Array of distributor names'
      },
      budget: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: true,
        comment: 'Production budget in currency'
      },
      
      // Technical Specifications
      aspect_ratio: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: '2.39:1',
        comment: 'Aspect ratio (2.39:1, 1.85:1, 16:9)'
      },
      sound_mix: {
        type: DataTypes.JSONB,
        allowNull: true,
        defaultValue: [],
        comment: 'Sound formats: ["Dolby Atmos", "DTS:X"]'
      },
      camera_used: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'Camera equipment used'
      },
      
      // Music & Soundtrack
      has_songs: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        comment: 'Whether movie has songs'
      },
      song_count: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'Number of songs in movie'
      },
      
      // Booking & Availability
      platform_status: {
        type: DataTypes.STRING,
        defaultValue: 'coming_soon',
        allowNull: true,
        comment: 'Current platform status'
      },
      booking_opens_at: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'When booking becomes available'
      },
      booking_closes_at: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'When booking stops'
      },
      is_re_release: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        comment: 'Is this a re-release'
      },
      
      // Pricing Guidelines
      suggested_base_price_min: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        comment: 'Minimum suggested ticket price'
      },
      suggested_base_price_max: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        comment: 'Maximum suggested ticket price'
      },
      premium_multiplier: {
        type: DataTypes.DECIMAL(3, 2),
        allowNull: true,
        defaultValue: 1.5,
        comment: 'Premium format price multiplier'
      },
      
      // Marketing & SEO
      meta_title: {
        type: DataTypes.STRING(60),
        allowNull: true,
        comment: 'SEO meta title (max 60 chars)'
      },
      meta_description: {
        type: DataTypes.STRING(160),
        allowNull: true,
        comment: 'SEO meta description (max 160 chars)'
      },
      keywords: {
        type: DataTypes.JSONB,
        allowNull: true,
        defaultValue: [],
        comment: 'SEO keywords array'
      },
      social_hashtags: {
        type: DataTypes.JSONB,
        allowNull: true,
        defaultValue: [],
        comment: 'Social media hashtags'
      },
      
      // Featured & Promotional
      is_featured: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        comment: 'Show on homepage as featured'
      },
      is_trending: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        comment: 'Mark as trending now'
      },
      banner_campaign_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        comment: 'Show in homepage banner'
      },
      banner_position: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'Position in banner carousel'
      },
      campaign_start_date: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'Banner campaign start date'
      },
      campaign_end_date: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'Banner campaign end date'
      },
      
      // Important Information
      things_to_know: {
        type: DataTypes.JSONB,
        allowNull: true,
        defaultValue: [],
        comment: 'Array of important info points'
      },
      
      // Series Information
      is_part_of_series: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        comment: 'Is part of a movie series'
      },
      series_name: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'Name of the movie series'
      },
      series_order: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'Order number in series'
      },
      
      // Analytics
      total_bookings: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        comment: 'Total bookings count'
      },
      average_user_rating: {
        type: DataTypes.DECIMAL(3, 2),
        allowNull: true,
        comment: 'Average user rating calculated from bookings'
      },
      total_ratings: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        comment: 'Total number of user ratings'
      },
      
      // Administrative
      approval_status: {
        type: DataTypes.ENUM('draft', 'pending_review', 'approved', 'published', 'archived'),
        defaultValue: 'draft',
        comment: 'Movie approval workflow status'
      },
      approved_by: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'SuperAdmin who approved the movie'
      },
      approved_at: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'When the movie was approved'
      },
      internal_notes: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Internal admin notes'
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      tenant_id: {
        type: DataTypes.STRING,
        allowNull: false,
        index: true,
        comment: 'Admin tenant who owns this movie'
      },
    },
    { 
      tableName: 'movies',
      timestamps: true, // Re-enabled timestamps for super-admin compatibility
      underscored: true, // Use snake_case for timestamp columns (created_at, updated_at)
      indexes: [
        {
          fields: ['tenant_id', 'is_active']
        },
        {
          fields: ['title']
        },
        {
          fields: ['genres']
        },
        {
          fields: ['city']
        }
        // Removed created_at index temporarily until columns exist
      ]
    },
  )
}
