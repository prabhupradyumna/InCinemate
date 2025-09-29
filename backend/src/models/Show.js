import { DataTypes } from 'sequelize'

export function defineShow(sequelize) {
  return sequelize.define(
    'Show',
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
        comment: 'Reference to the movie being shown'
      },
      auditorium_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'auditoriums',
          key: 'id'
        },
        comment: 'Reference to the auditorium where show is running'
      },
      show_datetime: {
        type: DataTypes.DATE,
        allowNull: false,
        comment: 'Date and time of the show'
      },
      pricing: {
        type: DataTypes.JSONB,
        allowNull: false,
        comment: 'Dynamic pricing structure: { "Standard": 250, "VIP": 500 } or { "row_A": 300, "row_B": 250 }'
      },
      status: {
        type: DataTypes.ENUM('scheduled', 'live', 'completed', 'cancelled'),
        allowNull: false,
        defaultValue: 'scheduled',
      },
      tenant_id: {
        type: DataTypes.STRING,
        allowNull: false,
        index: true,
        comment: 'Admin tenant who scheduled this show'
      },
      created_by: {
        type: DataTypes.UUID,
        allowNull: false,
        comment: 'Admin user who created this show'
      },
    },
    { 
      tableName: 'shows',
      indexes: [
        {
          fields: ['tenant_id', 'status']
        },
        {
          fields: ['movie_id']
        },
        {
          fields: ['auditorium_id']
        },
        {
          fields: ['show_datetime']
        }
      ]
    },
  )
}
