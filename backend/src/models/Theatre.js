import { DataTypes } from 'sequelize'

export function defineTheatre(sequelize) {
  return sequelize.define(
    'Theatre',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      address: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      city: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      state: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      country: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: 'India',
      },
      postal_code: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      tax_rate_percent: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: false,
        defaultValue: 0,
      },
      contact_phone: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      contact_email: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      owner_name: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
    },
    { 
      tableName: 'theatres',
      timestamps: true,
    },
  )
}
