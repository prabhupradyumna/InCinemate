import { DataTypes } from 'sequelize'

export function defineOtpRequest(sequelize) {
  return sequelize.define(
    'OtpRequest',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      user_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: { model: 'users', key: 'id' }
      },
      channel: {
        type: DataTypes.ENUM('sms', 'email'),
        allowNull: false,
      },
      recipient: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: 'Phone number for sms or email address for email'
      },
      purpose: {
        type: DataTypes.ENUM('login', 'register', 'reset'),
        allowNull: false,
        defaultValue: 'login'
      },
      code_hash: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      expires_at: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      attempt_count: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      consumed_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      tenant_id: {
        type: DataTypes.STRING,
        allowNull: true,
        index: true,
      },
    },
    { 
      tableName: 'otp_requests',
      indexes: [
        { fields: ['recipient', 'purpose'] },
        { fields: ['expires_at'] },
      ]
    },
  )
}



