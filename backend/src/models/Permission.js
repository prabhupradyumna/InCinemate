import { DataTypes } from 'sequelize'

export function definePermission(sequelize) {
  return sequelize.define(
    'Permission',
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      category: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'general',
      },
    },
    { 
      tableName: 'permissions',
      timestamps: true,
    },
  )
}
