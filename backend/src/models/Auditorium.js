import { DataTypes } from 'sequelize'

export function defineAuditorium(sequelize) {
  const Auditorium = sequelize.define(
    'Auditorium',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      theatre_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'theatres',
          key: 'id',
        },
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      capacity: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0,
      },
      total_seats: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: 'Total number of seats in the auditorium',
      },
      screen_type: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: 'Standard',
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
    },
    {
      tableName: 'auditoriums',
      timestamps: true,
    },
  )

  // Associations are defined in models/index.js

  return Auditorium
}
