import { DataTypes } from 'sequelize'

export function defineMovieCast(sequelize) {
  return sequelize.define(
    'MovieCast',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      movie_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'movies',
          key: 'id'
        },
        onDelete: 'CASCADE',
        comment: 'Reference to the movie'
      },
      actor_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'actors',
          key: 'id'
        },
        onDelete: 'RESTRICT',
        comment: 'Reference to the actor'
      },
      
      // Role in Movie
      character_name: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: 'Name of the character played'
      },
      character_description: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Description of the character'
      },
      role_type: {
        type: DataTypes.ENUM('lead', 'supporting', 'special_appearance', 'cameo', 'voice', 'narrator'),
        allowNull: false,
        comment: 'Type of role in the movie'
      },
      
      // Display & Ordering
      display_order: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: 'Order for displaying in cast list (lower = higher priority)'
      },
      is_featured: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        comment: 'Whether to feature this cast member prominently'
      },
      screen_time_minutes: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'Approximate screen time in minutes'
      },
      
      // Character Specific
      character_image_url: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'Character-specific image (in costume/makeup)'
      },
      character_type: {
        type: DataTypes.ENUM('protagonist', 'antagonist', 'supporting', 'comic_relief', 'love_interest', 'mentor', 'other'),
        allowNull: true,
        comment: 'Character archetype'
      },
      
      // Administrative
      created_by: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'Admin who added this cast member'
      },
    },
    { 
      tableName: 'movie_cast',
      indexes: [
        {
          fields: ['movie_id']
        },
        {
          fields: ['actor_id']
        },
        {
          fields: ['role_type']
        },
        {
          fields: ['display_order']
        },
        {
          unique: true,
          fields: ['movie_id', 'actor_id', 'character_name'],
          name: 'unique_movie_actor_character'
        }
      ]
    },
  )
}