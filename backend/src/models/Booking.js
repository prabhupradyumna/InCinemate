import { DataTypes } from 'sequelize'

export function defineBooking(sequelize) {
  return sequelize.define(
    'Booking',
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
      showId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      seats: {
        type: DataTypes.JSONB,
        allowNull: false,
        defaultValue: [],
      },
      totalPrice: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM('pending', 'paid', 'cancelled'),
        allowNull: false,
        defaultValue: 'pending',
      },
    },
    { tableName: 'bookings' },
  )
}
