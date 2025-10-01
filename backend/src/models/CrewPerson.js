import { DataTypes } from 'sequelize'

export function defineCrewPerson(sequelize) {
  return sequelize.define(
    'CrewPerson',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: 'Crew member full name'
      },
      profile_image_url: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'Crew member profile image URL'
      },
      bio: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Crew member biography/description'
      },
      specialty: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'Primary specialty (e.g., "Action Director", "Bollywood Choreographer")'
      },
      date_of_birth: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'Crew member date of birth'
      },
      nationality: {
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: 'Crew member nationality'
      },
      awards: {
        type: DataTypes.JSONB,
        allowNull: true,
        defaultValue: [],
        comment: 'Array of awards and recognitions'
      },
      notable_works: {
        type: DataTypes.JSONB,
        allowNull: true,
        defaultValue: [],
        comment: 'Array of notable movies/projects'
      },
      social_media: {
        type: DataTypes.JSONB,
        allowNull: true,
        defaultValue: {},
        comment: 'Social media handles: {instagram, twitter, facebook}'
      },
      
      // Analytics (auto-calculated)
      total_credits: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        comment: 'Total number of movie credits'
      },
      avg_movie_rating: {
        type: DataTypes.DECIMAL(3, 2),
        allowNull: true,
        comment: 'Average rating of movies worked on'
      },
      
      // Administrative
      is_verified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        comment: 'Whether crew profile is verified'
      },
      created_by: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'Admin who created this crew profile'
      },
    },
    { 
      tableName: 'crew_persons',
      indexes: [
        {
          fields: ['name']
        },
        {
          fields: ['specialty']
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