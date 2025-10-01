import { DataTypes } from 'sequelize'

export function defineActor(sequelize) {
  return sequelize.define(
    'Actor',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: 'Actor full name'
      },
      profile_image_url: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'Actor profile/headshot image URL'
      },
      date_of_birth: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'Actor date of birth'
      },
      bio: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Actor biography/description'
      },
      nationality: {
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: 'Actor nationality'
      },
      height: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'Actor height (e.g., "5 ft 8 in")'
      },
      awards: {
        type: DataTypes.JSONB,
        allowNull: true,
        defaultValue: [],
        comment: 'Array of awards and recognitions'
      },
      social_media: {
        type: DataTypes.JSONB,
        allowNull: true,
        defaultValue: {},
        comment: 'Social media handles: {instagram, twitter, facebook}'
      },
      
      // Analytics (auto-calculated)
      total_movies: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        comment: 'Total number of movies acted in'
      },
      avg_movie_rating: {
        type: DataTypes.DECIMAL(3, 2),
        allowNull: true,
        comment: 'Average rating of movies acted in'
      },
      
      // Administrative
      is_verified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        comment: 'Whether actor profile is verified'
      },
      created_by: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'Admin who created this actor profile'
      },
    },
    { 
      tableName: 'actors',
      indexes: [
        {
          fields: ['name']
        },
        {
          fields: ['nationality']
        },
        {
          fields: ['is_verified']
        }
      ]
    },
  )
}