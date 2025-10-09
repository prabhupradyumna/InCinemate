import { DataTypes } from 'sequelize'

export function defineBooking(sequelize) {
  return sequelize.define(
    'Booking',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      show_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'shows',
          key: 'id'
        },
        comment: 'Reference to the show being booked'
      },
      customer_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        },
        comment: 'Reference to the customer (null for guest bookings)'
      },
      customer_email: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: 'Customer email for the booking'
      },
      customer_name: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'Customer name for the booking'
      },
      customer_phone: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'Customer phone for the booking'
      },
      subtotal: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        comment: 'Subtotal before taxes and discounts'
      },
      discount_amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
        comment: 'Discount amount applied'
      },
      taxes: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
        comment: 'Tax amount'
      },
      total_price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        comment: 'Final total price after discounts and taxes'
      },
      commission: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
        comment: 'Platform commission amount'
      },
      coupon_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: 'coupons',
          key: 'id'
        },
        comment: 'Reference to applied coupon'
      },
      payment_id: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'External payment gateway transaction ID'
      },
      payment_method: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'Payment method used (card, upi, netbanking, etc.)'
      },
      payment_status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'PENDING',
        validate: {
          isIn: [['PENDING', 'SUCCESS', 'FAILED', 'CANCELLED']]
        },
        comment: 'Payment status from gateway'
      },
      booking_status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'PENDING',
        validate: {
          isIn: [['PENDING', 'CONFIRMED', 'CANCELLED', 'REFUNDED']]
        },
        comment: 'Booking status'
      },
      merchant_order_id: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'PhonePe merchant order ID'
      },
      payment_response: {
        type: DataTypes.JSONB,
        allowNull: true,
        comment: 'Payment gateway response data'
      },
      payment_completed_at: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'Payment completion timestamp'
      },
      status: {
        type: DataTypes.ENUM('pending', 'paid', 'cancelled', 'refunded'),
        allowNull: false,
        defaultValue: 'pending',
      },
      ticket_qr_code: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'QR code data for ticket validation'
      },
      booking_reference: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: 'Unique booking reference number for customer'
      },
      tenant_id: {
        type: DataTypes.STRING,
        allowNull: false,
        index: true,
        comment: 'Admin tenant for this booking'
      },
    },
    { 
      tableName: 'bookings',
      indexes: [
        {
          fields: ['tenant_id', 'status']
        },
        {
          fields: ['show_id']
        },
        {
          fields: ['customer_id']
        },
        {
          fields: ['customer_email']
        },
        {
          fields: ['booking_reference'],
          unique: true
        },
        {
          fields: ['payment_id']
        },
        {
          fields: ['merchant_order_id']
        }
      ]
    },
  )
}
