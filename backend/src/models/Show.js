import { DataTypes } from 'sequelize'

export function defineShow(sequelize) {
  return sequelize.define(
    'Show',
    {
      tenantId: {
        type: DataTypes.STRING,
        allowNull: false,
        index: true,
      },
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      movieTitle: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      venueName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      screenName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      showDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      showTime: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      pricingPremium: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 20,
      },
      pricingRegular: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 10,
      },
      status: {
        type: DataTypes.ENUM('pending', 'approved', 'live', 'completed'),
        allowNull: false,
        defaultValue: 'pending',
      },
    },
    { tableName: 'shows' },
  )
}
