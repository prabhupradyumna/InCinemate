import { DataTypes } from 'sequelize'

export function defineSeatPricing(sequelize) {
  const SeatPricing = sequelize.define(
    'SeatPricing',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
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
      auditorium_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'auditoriums',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      show_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: 'shows',
          key: 'id'
        },
        onDelete: 'CASCADE',
        comment: 'Null means base price for this seat across shows; value means show-specific override'
      },
      price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      currency: {
        type: DataTypes.STRING(3),
        allowNull: false,
        defaultValue: 'INR'
      },
      pricing_type: {
        type: DataTypes.ENUM('base', 'show_specific'),
        allowNull: false,
        defaultValue: 'base'
      },
      is_dynamic: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      effective_from: {
        type: DataTypes.DATE,
        allowNull: true
      },
      effective_to: {
        type: DataTypes.DATE,
        allowNull: true
      },
      metadata: {
        type: DataTypes.JSONB,
        allowNull: true
      }
    },
    {
      tableName: 'seat_pricing',
      timestamps: true,
      indexes: [
        { fields: ['auditorium_id'] },
        { fields: ['show_id'] },
        { fields: ['seat_id', 'show_id'], unique: true },
        { fields: ['effective_from'] },
        { fields: ['effective_to'] }
      ]
    }
  )

  return SeatPricing
}


