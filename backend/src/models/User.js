import { DataTypes } from 'sequelize'

export function defineUser(sequelize) {
  return sequelize.define(
    'User',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      email: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: true,
      },
      password_hash: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      role: {
        type: DataTypes.ENUM('super_admin', 'admin', 'customer', 'ticket_checker'),
        allowNull: false,
        defaultValue: 'customer',
      },
      tenant_id: {
        type: DataTypes.STRING,
        allowNull: true, // null for super_admin
        index: true,
      },
      full_name: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      phone: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true,
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
    },
    { tableName: 'users' },
  )
}
