import { DataTypes } from 'sequelize'

export function defineRefreshToken(sequelize) {
  return sequelize.define(
    'RefreshToken',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      user_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'users', key: 'id' },
      },
      token: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      expires_at: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      revoked: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      tenant_id: {
        type: DataTypes.STRING,
        allowNull: true, // null for super_admin
        index: true,
      },
    },
    { tableName: 'refresh_tokens' },
  )
}
