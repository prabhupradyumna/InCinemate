import { DataTypes } from 'sequelize'

export function defineAuditoriumRequest(sequelize) {
  return sequelize.define(
    'AuditoriumRequest',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      tenant_id: {
        type: DataTypes.STRING,
        allowNull: false,
        references: {
          model: 'tenants',
          key: 'tenant_id',
        },
      },
      theatre_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'theatres',
          key: 'id',
        },
      },
      auditorium_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      blueprint_url: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      status: {
        type: DataTypes.ENUM('pending', 'approved', 'rejected'),
        defaultValue: 'pending',
      },
      approved_by: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id',
        },
      },
      approved_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      rejection_reason: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    { 
      tableName: 'auditorium_requests',
      timestamps: true,
    },
  )
}
