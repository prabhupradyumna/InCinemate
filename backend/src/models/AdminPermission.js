import { DataTypes } from 'sequelize'

export function defineAdminPermission(sequelize) {
  return sequelize.define(
    'AdminPermission',
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      user_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
      },
      permission_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'permissions',
          key: 'id',
        },
      },
      granted_by: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
      },
      granted_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    { 
      tableName: 'admin_permissions',
      timestamps: false,
      indexes: [
        {
          unique: true,
          fields: ['user_id', 'permission_id'],
        },
      ],
    },
  )
}
