import { DataTypes } from 'sequelize'

export function defineMovieCrew(sequelize) {
  return sequelize.define(
    'MovieCrew',
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
      person_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'crew_persons',
          key: 'id'
        },
        onDelete: 'RESTRICT',
        comment: 'Reference to the crew person'
      },
      
      // Role Information
      role_category: {
        type: DataTypes.ENUM('direction', 'writing', 'production', 'music', 'technical', 'art', 'other'),
        allowNull: false
      },
      role_title: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: 'Specific role title (e.g., "Director", "Music Director", "Cinematographer")'
      },
      custom_credit_text: {
        type: DataTypes.STRING(500),
        allowNull: true,
        comment: 'Custom text for credits (e.g., "Creative Producer")'
      },
      
      // Hierarchy & Display
      is_primary: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        comment: 'Is this the main person for this role (main director, main producer, etc.)'
      },
      display_order: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: 'Order for displaying in crew list (lower = higher priority)'
      },
      
      // Additional Details
      contribution_description: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Description of specific contribution to this movie'
      },
      department: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'Department/team they worked with'
      },
      
      // Administrative
      created_by: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'Admin who added this crew member'
      },
    },
    { 
      tableName: 'movie_crew',
      indexes: [
        {
          fields: ['movie_id']
        },
        {
          fields: ['person_id']
        },
        {
          fields: ['role_category', 'role_title']
        },
        {
          fields: ['is_primary']
        },
        {
          fields: ['display_order']
        },
        {
          unique: true,
          fields: ['movie_id', 'person_id', 'role_title'],
          name: 'unique_movie_person_role'
        }
      ]
    },
  )
}