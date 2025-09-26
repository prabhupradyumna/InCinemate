import { DataTypes } from 'sequelize'

export function defineSeat(sequelize) {
  return sequelize.define(
    'Seat',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      auditorium_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'auditoriums',
          key: 'id',
        },
      },
      row: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      number: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      category: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'Standard',
      },
      x_position: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'X coordinate for visual seat map',
      },
      y_position: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'Y coordinate for visual seat map',
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
    },
    { 
      tableName: 'seats',
      timestamps: true,
      indexes: [
        {
          unique: true,
          fields: ['auditorium_id', 'row', 'number'],
        },
      ],
    },
  )
}
