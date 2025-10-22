import { DataTypes } from 'sequelize'

export function defineBookedSeat(sequelize) {
  return sequelize.define(
    'BookedSeat',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      booking_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'bookings',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      seat_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'seats',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      price_paid: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        comment: 'Price paid for this specific seat'
      },
      seat_category: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: 'Category of the seat at time of booking (for historical reference)'
      },
    },
    { 
      tableName: 'booked_seats',
      indexes: [
        {
          fields: ['booking_id']
        },
        {
          fields: ['seat_id']
        },
        {
          unique: true,
          fields: ['booking_id', 'seat_id'],
          name: 'unique_booking_seat'
        }
      ]
    },
  )
}
