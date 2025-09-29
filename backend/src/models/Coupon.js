import { DataTypes } from 'sequelize'

export function defineCoupon(sequelize) {
  return sequelize.define(
    'Coupon',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      code: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: 'Unique coupon code (e.g., SAVE20, WELCOME50)'
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: 'Display name for the coupon'
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      discount_type: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          isIn: [['percentage', 'fixed']]
        },
        comment: 'Type of discount: percentage or fixed amount'
      },
      value: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        comment: 'Discount value (percentage or fixed amount)'
      },
      min_purchase_amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        defaultValue: 0,
        comment: 'Minimum purchase amount to use this coupon'
      },
      max_discount_amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        comment: 'Maximum discount amount (for percentage coupons)'
      },
      usage_limit: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'Total number of times this coupon can be used'
      },
      usage_count: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        comment: 'Number of times this coupon has been used'
      },
      expires_at: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'Expiration date for the coupon'
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      tenant_id: {
        type: DataTypes.STRING,
        allowNull: false,
        index: true,
        comment: 'Admin tenant who created this coupon'
      },
      created_by: {
        type: DataTypes.UUID,
        allowNull: false,
        comment: 'Admin user who created this coupon'
      },
    },
    { 
      tableName: 'coupons',
      indexes: [
        {
          fields: ['tenant_id', 'is_active']
        },
        {
          fields: ['code'],
          unique: true
        },
        {
          fields: ['expires_at']
        }
      ]
    },
  )
}
