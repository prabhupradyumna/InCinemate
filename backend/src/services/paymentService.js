import { HTTP_STATUS } from '../constants.js'

/**
 * Payment Service for handling payment processing
 * This is a basic implementation that can be extended with actual payment gateways
 */
export class PaymentService {
  // Mock payment gateway configurations
  static PAYMENT_METHODS = {
    CARD: 'card',
    UPI: 'upi',
    NETBANKING: 'netbanking',
    WALLET: 'wallet'
  }

  static PAYMENT_STATUS = {
    PENDING: 'pending',
    SUCCESS: 'success',
    FAILED: 'failed',
    CANCELLED: 'cancelled',
    REFUNDED: 'refunded'
  }

  /**
   * Process payment for a booking
   * @param {Object} paymentData - Payment information
   * @param {string} paymentData.booking_id - Booking ID
   * @param {number} paymentData.amount - Payment amount
   * @param {string} paymentData.currency - Currency code (default: INR)
   * @param {string} paymentData.payment_method - Payment method
   * @param {Object} paymentData.payment_details - Payment method specific details
   * @param {string} paymentData.customer_email - Customer email
   * @param {string} paymentData.customer_phone - Customer phone
   * @returns {Promise<{success: boolean, payment_id: string, status: string, message: string}>}
   */
  static async processPayment(paymentData) {
    try {
      const {
        booking_id,
        amount,
        currency = 'INR',
        payment_method,
        payment_details,
        customer_email,
        customer_phone
      } = paymentData

      // Validate payment data
      if (!booking_id || !amount || !payment_method) {
        throw new Error('Missing required payment data')
      }

      if (amount <= 0) {
        throw new Error('Invalid payment amount')
      }

      // Generate payment ID
      const payment_id = `PAY_${Date.now()}_${Math.random().toString(36).substr(2, 8).toUpperCase()}`

      // Simulate payment processing based on method
      const result = await this.simulatePaymentProcessing(payment_method, amount, payment_details)

      if (result.success) {
        console.log(`[PaymentService] Payment successful: ${payment_id} for booking ${booking_id}`)
        return {
          success: true,
          payment_id,
          status: this.PAYMENT_STATUS.SUCCESS,
          message: 'Payment processed successfully',
          gateway_response: result.gateway_response
        }
      } else {
        console.log(`[PaymentService] Payment failed: ${payment_id} for booking ${booking_id}`)
        return {
          success: false,
          payment_id,
          status: this.PAYMENT_STATUS.FAILED,
          message: result.error || 'Payment processing failed',
          gateway_response: result.gateway_response
        }
      }
    } catch (error) {
      console.error(`[PaymentService] Payment processing error:`, error.message)
      return {
        success: false,
        payment_id: null,
        status: this.PAYMENT_STATUS.FAILED,
        message: error.message,
        gateway_response: null
      }
    }
  }

  /**
   * Verify payment status
   * @param {string} payment_id - Payment ID to verify
   * @returns {Promise<{success: boolean, status: string, amount: number, message: string}>}
   */
  static async verifyPayment(payment_id) {
    try {
      if (!payment_id) {
        throw new Error('Payment ID is required')
      }

      // Simulate payment verification
      // In real implementation, this would call the payment gateway's verification API
      const isVerified = Math.random() > 0.1 // 90% success rate for demo

      if (isVerified) {
        return {
          success: true,
          status: this.PAYMENT_STATUS.SUCCESS,
          amount: 0, // Would be fetched from gateway
          message: 'Payment verified successfully'
        }
      } else {
        return {
          success: false,
          status: this.PAYMENT_STATUS.FAILED,
          amount: 0,
          message: 'Payment verification failed'
        }
      }
    } catch (error) {
      console.error(`[PaymentService] Payment verification error:`, error.message)
      return {
        success: false,
        status: this.PAYMENT_STATUS.FAILED,
        amount: 0,
        message: error.message
      }
    }
  }

  /**
   * Initiate refund for a payment
   * @param {string} payment_id - Payment ID to refund
   * @param {number} amount - Refund amount (optional, defaults to full amount)
   * @param {string} reason - Refund reason
   * @returns {Promise<{success: boolean, refund_id: string, status: string, message: string}>}
   */
  static async initiateRefund(payment_id, amount = null, reason = 'Customer request') {
    try {
      if (!payment_id) {
        throw new Error('Payment ID is required')
      }

      // Generate refund ID
      const refund_id = `REF_${Date.now()}_${Math.random().toString(36).substr(2, 8).toUpperCase()}`

      // Simulate refund processing
      const isRefunded = Math.random() > 0.05 // 95% success rate for demo

      if (isRefunded) {
        console.log(`[PaymentService] Refund successful: ${refund_id} for payment ${payment_id}`)
        return {
          success: true,
          refund_id,
          status: this.PAYMENT_STATUS.REFUNDED,
          message: 'Refund processed successfully',
          amount: amount || 0 // Would be fetched from original payment
        }
      } else {
        console.log(`[PaymentService] Refund failed: ${refund_id} for payment ${payment_id}`)
        return {
          success: false,
          refund_id,
          status: this.PAYMENT_STATUS.FAILED,
          message: 'Refund processing failed'
        }
      }
    } catch (error) {
      console.error(`[PaymentService] Refund processing error:`, error.message)
      return {
        success: false,
        refund_id: null,
        status: this.PAYMENT_STATUS.FAILED,
        message: error.message
      }
    }
  }

  /**
   * Get payment methods available for a customer
   * @param {string} customer_email - Customer email
   * @returns {Promise<Array>} Available payment methods
   */
  static async getAvailablePaymentMethods(customer_email) {
    try {
      // In real implementation, this would check customer's saved payment methods
      // and available payment options based on amount, location, etc.
      
      return [
        {
          method: this.PAYMENT_METHODS.CARD,
          name: 'Credit/Debit Card',
          description: 'Visa, Mastercard, RuPay',
          icon: 'card',
          enabled: true
        },
        {
          method: this.PAYMENT_METHODS.UPI,
          name: 'UPI',
          description: 'Google Pay, PhonePe, Paytm',
          icon: 'upi',
          enabled: true
        },
        {
          method: this.PAYMENT_METHODS.NETBANKING,
          name: 'Net Banking',
          description: 'All major banks',
          icon: 'bank',
          enabled: true
        },
        {
          method: this.PAYMENT_METHODS.WALLET,
          name: 'Digital Wallet',
          description: 'Paytm, Mobikwik, Freecharge',
          icon: 'wallet',
          enabled: true
        }
      ]
    } catch (error) {
      console.error(`[PaymentService] Error getting payment methods:`, error.message)
      return []
    }
  }

  /**
   * Simulate payment processing based on payment method
   * @private
   */
  static async simulatePaymentProcessing(payment_method, amount, payment_details) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000))

    // Simulate different success rates based on payment method
    let successRate = 0.9 // 90% default success rate

    switch (payment_method) {
      case this.PAYMENT_METHODS.CARD:
        successRate = 0.85 // 85% success rate for cards
        break
      case this.PAYMENT_METHODS.UPI:
        successRate = 0.95 // 95% success rate for UPI
        break
      case this.PAYMENT_METHODS.NETBANKING:
        successRate = 0.80 // 80% success rate for net banking
        break
      case this.PAYMENT_METHODS.WALLET:
        successRate = 0.90 // 90% success rate for wallets
        break
    }

    const isSuccess = Math.random() < successRate

    if (isSuccess) {
      return {
        success: true,
        gateway_response: {
          transaction_id: `TXN_${Date.now()}`,
          gateway_reference: `GW_${Math.random().toString(36).substr(2, 10)}`,
          processed_at: new Date().toISOString(),
          amount,
          currency: 'INR',
          payment_method
        }
      }
    } else {
      const errorMessages = [
        'Insufficient funds',
        'Card declined',
        'Network timeout',
        'Invalid payment details',
        'Payment gateway error'
      ]
      
      return {
        success: false,
        error: errorMessages[Math.floor(Math.random() * errorMessages.length)],
        gateway_response: {
          error_code: `ERR_${Math.floor(Math.random() * 1000)}`,
          error_message: 'Payment processing failed',
          processed_at: new Date().toISOString()
        }
      }
    }
  }

  /**
   * Generate QR code data for ticket
   * @param {string} booking_reference - Booking reference
   * @param {string} show_id - Show ID
   * @param {string[]} seat_ids - Seat IDs
   * @returns {string} QR code data
   */
  static generateTicketQRCode(booking_reference, show_id, seat_ids) {
    const qrData = {
      booking_reference,
      show_id,
      seat_ids,
      generated_at: new Date().toISOString(),
      type: 'movie_ticket'
    }
    
    // In real implementation, this would be encoded/encrypted
    return `TICKET_${Buffer.from(JSON.stringify(qrData)).toString('base64')}`
  }

  /**
   * Validate ticket QR code
   * @param {string} qr_code - QR code data
   * @returns {Promise<{valid: boolean, booking_data: object|null, message: string}>}
   */
  static async validateTicketQRCode(qr_code) {
    try {
      if (!qr_code || !qr_code.startsWith('TICKET_')) {
        return {
          valid: false,
          booking_data: null,
          message: 'Invalid QR code format'
        }
      }

      // Decode QR code data
      const encodedData = qr_code.replace('TICKET_', '')
      const decodedData = JSON.parse(Buffer.from(encodedData, 'base64').toString())
      
      // Validate QR code structure
      if (!decodedData.booking_reference || !decodedData.show_id || !decodedData.seat_ids) {
        return {
          valid: false,
          booking_data: null,
          message: 'Invalid QR code data'
        }
      }

      // Check if QR code is not too old (e.g., 24 hours)
      const generatedAt = new Date(decodedData.generated_at)
      const now = new Date()
      const hoursDiff = (now - generatedAt) / (1000 * 60 * 60)
      
      if (hoursDiff > 24) {
        return {
          valid: false,
          booking_data: null,
          message: 'QR code has expired'
        }
      }

      return {
        valid: true,
        booking_data: decodedData,
        message: 'QR code is valid'
      }
    } catch (error) {
      console.error(`[PaymentService] QR code validation error:`, error.message)
      return {
        valid: false,
        booking_data: null,
        message: 'QR code validation failed'
      }
    }
  }
}

export default PaymentService
