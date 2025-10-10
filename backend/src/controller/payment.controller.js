import { HTTP_STATUS } from '../constants.js';
import crypto from 'crypto';

class PaymentController {
  constructor() {
    // HARDCODED FOR TESTING - Replace with env vars in production
    this.phonePeConfig = {
      clientId: 'TEST-M23FQVLBOWM35_25100',
      clientSecret: 'NjYyNzY1ZmYtNjQwNy00ZTg1LTg4ODktNzRjMTJhMzBhNjRl',
      clientVersion: '1',
      baseUrl: 'https://api-preprod.phonepe.com/apis/pg-sandbox',
      redirectUrl: 'http://localhost:3000/payment-success',
      callbackUrl: 'http://localhost:9000/api/payments/phonepe-callback',
      saltKey: '099eb0cd-02cf-4e2a-8aca-3e6c6a343418', // PhonePe salt key for checksum
      saltIndex: 1 // PhonePe salt index
    };
    this.accessToken = null;
    this.tokenExpiry = null;
    
    console.log('[PaymentController] Config loaded:', {
      clientId: this.phonePeConfig.clientId ? 'SET' : 'MISSING',
      clientSecret: this.phonePeConfig.clientSecret ? 'SET' : 'MISSING',
      clientVersion: this.phonePeConfig.clientVersion,
      baseUrl: this.phonePeConfig.baseUrl
    });
  }

  // Generate checksum for PhonePe API
  generateChecksum(payload) {
    const base64Payload = Buffer.from(JSON.stringify(payload)).toString('base64');
    const checksumString = base64Payload + this.phonePeConfig.saltKey;
    const checksum = crypto.createHash('sha256').update(checksumString).digest('hex');
    return checksum + '###' + this.phonePeConfig.saltIndex;
  }

  // Verify checksum from PhonePe response
  verifyChecksum(payload, checksum) {
    const base64Payload = Buffer.from(JSON.stringify(payload)).toString('base64');
    const checksumString = base64Payload + this.phonePeConfig.saltKey;
    const expectedChecksum = crypto.createHash('sha256').update(checksumString).digest('hex');
    const providedChecksum = checksum.split('###')[0];
    return expectedChecksum === providedChecksum;
  }

  // Get PhonePe access token
  async getAccessToken() {
    try {
      console.log('[PaymentController] getAccessToken called');
      // Check if token is still valid
      if (this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
        console.log('[PaymentController] Using cached access token');
        return this.accessToken;
      }

      console.log('[PaymentController] Fetching new access token from PhonePe');
      console.log('[PaymentController] Config:', {
        clientId: this.phonePeConfig.clientId,
        clientVersion: this.phonePeConfig.clientVersion,
        baseUrl: this.phonePeConfig.baseUrl
      });

      // Prepare form data for OAuth token request
      const formData = new URLSearchParams();
      formData.append('client_id', this.phonePeConfig.clientId);
      formData.append('client_version', this.phonePeConfig.clientVersion);
      formData.append('client_secret', this.phonePeConfig.clientSecret);
      formData.append('grant_type', 'client_credentials');

      console.log('[PaymentController] OAuth URL:', `${this.phonePeConfig.baseUrl}/v1/oauth/token`);
      
      // Create abort controller for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      const response = await fetch(`${this.phonePeConfig.baseUrl}/v1/oauth/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: formData,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      console.log('[PaymentController] OAuth response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.log('[PaymentController] OAuth error response:', errorText);
        throw new Error(`Auth token request failed: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('[PaymentController] OAuth response data:', JSON.stringify(data, null, 2));
      
      if (data.access_token) {
        this.accessToken = data.access_token;
        // Set expiry based on expires_in (typically 3600 seconds = 1 hour)
        const expiresIn = data.expires_in || 3600;
        this.tokenExpiry = Date.now() + (expiresIn * 1000);
        return this.accessToken;
      } else {
        throw new Error('Failed to get access token from PhonePe');
      }
    } catch (error) {
      console.error('Error getting PhonePe access token:', error);
      if (error.name === 'AbortError') {
        throw new Error('PhonePe OAuth request timed out');
      }
      throw error;
    }
  }

  // Check payment status
  static async checkPaymentStatus(req, res) {
    try {
      console.log('[PaymentController] checkPaymentStatus called with:', req.params);
      const { merchantOrderId } = req.params;
      
      if (!merchantOrderId) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          error: 'Merchant order ID is required',
          message: 'Merchant order ID is required'
        });
      }
      
      // Get access token
      console.log('[PaymentController] Getting PhonePe access token for status check...');
      const controller = new PaymentController();
      const accessToken = await controller.getAccessToken();
      console.log('[PaymentController] Access token received:', accessToken ? 'YES' : 'NO');
      
      // Call PhonePe Order Status API
      const statusUrl = `${controller.phonePeConfig.baseUrl}/checkout/v2/order/${merchantOrderId}/status`;
      console.log('[PaymentController] Calling PhonePe status API:', statusUrl);
      
      const response = await fetch(statusUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `O-Bearer ${accessToken}`
        }
      });
      
      console.log('[PaymentController] PhonePe status API response:', response.status);
      
      if (!response.ok) {
        throw new Error(`PhonePe status API request failed: ${response.status}`);
      }
      
      const phonePeResponse = await response.json();
      console.log('[PaymentController] PhonePe status response:', JSON.stringify(phonePeResponse, null, 2));
      
      return res.json({
        success: true,
        data: phonePeResponse,
        message: 'Payment status retrieved successfully'
      });
      
    } catch (err) {
      console.error(`[PaymentController]-[checkPaymentStatus]: ${err.message}`);
      return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: err.message,
        message: 'Failed to check payment status'
      });
    }
  }

  // Initiate payment
  static async initiatePayment(req, res) {
    try {
      console.log('[PaymentController] initiatePayment called with:', req.body);
      
      const { booking_id, amount } = req.body;
      const sequelize = req.db || null; // Handle missing db for testing
      const models = req.models || {}; // Handle missing models for testing
      const { Booking, User } = models;

      if (!booking_id || !amount) {
        console.log('[PaymentController] Missing required fields');
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          error: 'Missing required fields: booking_id and amount',
          message: 'Booking ID and amount are required'
        });
      }

      // HARDCODED FOR TESTING - Comment out for production
      // Get booking details
      // const booking = await Booking.findByPk(booking_id, {
      //   include: [{
      //     model: User,
      //     as: 'User',
      //     attributes: ['id', 'email', 'phone']
      //   }]
      // });

      // if (!booking) {
      //   return res.status(HTTP_STATUS.NOT_FOUND).json({
      //     success: false,
      //     error: 'Booking not found',
      //     message: 'Invalid booking ID'
      //   });
      // }

      // Generate unique merchant order ID - Using hardcoded values for testing
      const merchantOrderId = `newtxn${Date.now()}`; // Using format from Postman collection
      
      // HARDCODED FOR TESTING - Comment out for production
      // Update booking with merchant order ID
      // await booking.update({
      //   merchant_order_id: merchantOrderId,
      //   payment_status: 'PENDING'
      // });

      // Prepare PhonePe payment request according to Postman collection
      const paymentRequest = {
        merchantOrderId: merchantOrderId,
        amount: Math.round(amount), // PhonePe expects amount in rupees (not paise)
        expireAfter: 1200, // 20 minutes expiry
        metaInfo: {
          udf1: `test1`, // HARDCODED FOR TESTING
          udf2: `new param2`, // HARDCODED FOR TESTING
          udf3: `test3`, // HARDCODED FOR TESTING
          udf4: `dummy value 4`, // HARDCODED FOR TESTING
          udf5: `addition infor ref1` // HARDCODED FOR TESTING
        },
        paymentFlow: {
          type: 'PG_CHECKOUT',
          message: 'Payment message used for collect requests', // HARDCODED FOR TESTING
          merchantUrls: {
            redirectUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment-success?merchantOrderId=${merchantOrderId}`
          }
        }
      };

      // Get access token
      console.log('[PaymentController] Getting PhonePe access token...');
      const controller = new PaymentController();
      const accessToken = await controller.getAccessToken();
      console.log('[PaymentController] Access token received:', accessToken ? 'YES' : 'NO');

      // Call PhonePe API
      console.log('[PaymentController] Calling PhonePe API with URL:', `${controller.phonePeConfig.baseUrl}/checkout/v2/pay`);
      console.log('[PaymentController] Payment request payload:', JSON.stringify(paymentRequest, null, 2));
      
      // Create abort controller for timeout
      const abortController = new AbortController();
      const timeoutId = setTimeout(() => abortController.abort(), 15000); // 15 second timeout

      const response = await fetch(`${controller.phonePeConfig.baseUrl}/checkout/v2/pay`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `O-Bearer ${accessToken}`
        },
        body: JSON.stringify(paymentRequest),
        signal: abortController.signal
      });

      clearTimeout(timeoutId);
      
      console.log('[PaymentController] PhonePe API response status:', response.status);

      if (!response.ok) {
        throw new Error(`PhonePe API request failed: ${response.status}`);
      }

      const phonePeResponse = await response.json();
      console.log('[PaymentController] PhonePe API response:', JSON.stringify(phonePeResponse, null, 2));

      // PhonePe returns direct response with redirectUrl, not wrapped in success/data
      if (phonePeResponse.redirectUrl) {
        console.log('[PaymentController] PhonePe payment URL:', phonePeResponse.redirectUrl);
        return res.json({
          success: true,
          data: {
            merchantOrderId: merchantOrderId,
            paymentUrl: phonePeResponse.redirectUrl,
            orderId: phonePeResponse.orderId,
            state: phonePeResponse.state,
            expireAt: phonePeResponse.expireAt
          },
          message: 'Payment initiated successfully'
        });
      } else {
        console.error('PhonePe API Error:', phonePeResponse);
        throw new Error(`PhonePe payment initiation failed: ${phonePeResponse.message || 'No redirect URL in response'}`);
      }

    } catch (err) {
      console.error(`[PaymentController]-[initiatePayment]: ${err.message}`);
      if (err.name === 'AbortError') {
        return res.status(HTTP_STATUS.REQUEST_TIMEOUT).json({
          success: false,
          error: 'Payment request timed out',
          message: 'Failed to initiate payment - request timeout'
        });
      }
      return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: err.message,
        message: 'Failed to initiate payment'
      });
    }
  }

  // Handle PhonePe callback
  static async handlePhonePeCallback(req, res) {
    try {
      const { response } = req.body;
      const xVerify = req.headers['x-verify'];

      if (!response || !xVerify) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          error: 'Missing required fields',
          message: 'Invalid callback request'
        });
      }

      // Decode the response
      const decodedResponse = JSON.parse(Buffer.from(response, 'base64').toString());
      
      // Verify checksum
      const controller = new PaymentController();
      if (!controller.verifyChecksum(decodedResponse, xVerify)) {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json({
          success: false,
          error: 'Invalid checksum',
          message: 'Unauthorized callback request'
        });
      }

      const sequelize = req.db;
      const { Booking } = req.models;

      // Find booking by merchant order ID
      const booking = await Booking.findOne({
        where: { merchant_order_id: decodedResponse.data.merchantOrderId }
      });

      if (!booking) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({
          success: false,
          error: 'Booking not found',
          message: 'Invalid merchant order ID'
        });
      }

      // Update booking status based on payment result
      let paymentStatus = 'FAILED';
      let bookingStatus = 'CANCELLED';

      if (decodedResponse.code === 'PAYMENT_SUCCESS') {
        paymentStatus = 'SUCCESS';
        bookingStatus = 'CONFIRMED';
      } else if (decodedResponse.code === 'PAYMENT_PENDING') {
        paymentStatus = 'PENDING';
        bookingStatus = 'PENDING';
      }

      await booking.update({
        payment_status: paymentStatus,
        booking_status: bookingStatus,
        payment_response: decodedResponse,
        payment_completed_at: new Date()
      });

      console.log(`Payment callback processed for booking ${booking.id}: ${paymentStatus}`);

      return res.json({
        success: true,
        message: 'Callback processed successfully'
      });

    } catch (err) {
      console.error(`[PaymentController]-[handlePhonePeCallback]: ${err.message}`);
      return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: err.message,
        message: 'Failed to process callback'
      });
    }
  }

  // Check payment status
  static async checkPaymentStatus(req, res) {
    try {
      const { merchantOrderId } = req.params;
      const sequelize = req.db;
      const { Booking } = req.models;

      if (!merchantOrderId) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          error: 'Missing merchant order ID',
          message: 'Merchant order ID is required'
        });
      }

      // HARDCODED FOR TESTING - Comment out for production
      // Find booking by merchant order ID
      // const booking = await Booking.findOne({
      //   where: { merchant_order_id: merchantOrderId }
      // });

      // if (!booking) {
      //   return res.status(HTTP_STATUS.NOT_FOUND).json({
      //     success: false,
      //     error: 'Booking not found',
      //     message: 'Invalid merchant order ID'
      //   });
      // }

      // Get access token and call PhonePe status API
      const controller = new PaymentController();
      const accessToken = await controller.getAccessToken();

      const statusRequest = {
        merchantOrderId: merchantOrderId
      };

      const checksum = controller.generateChecksum(statusRequest);

      const response = await fetch(`${controller.phonePeConfig.baseUrl}/checkout/v2/order/${merchantOrderId}/status`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `O-Bearer ${accessToken}`
        }
      });

      if (!response.ok) {
        throw new Error(`PhonePe status API request failed: ${response.status}`);
      }

      const phonePeResponse = await response.json();

      if (phonePeResponse.success) {
        // HARDCODED FOR TESTING - Comment out for production
        // Update booking with latest status if needed
        // const latestStatus = phonePeResponse.data.state;
        // if (latestStatus !== booking.payment_status) {
        //   await booking.update({
        //     payment_status: latestStatus,
        //     payment_response: phonePeResponse.data
        //   });
        // }

        const latestStatus = phonePeResponse.data?.state || 'PENDING'; // HARDCODED FOR TESTING

        return res.json({
          success: true,
          data: {
            status: latestStatus,
            merchantOrderId: merchantOrderId,
            paymentResponse: phonePeResponse.data
          },
          message: 'Payment status retrieved successfully'
        });
      } else {
        throw new Error('Failed to get payment status from PhonePe');
      }

    } catch (err) {
      console.error(`[PaymentController]-[checkPaymentStatus]: ${err.message}`);
      return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: err.message,
        message: 'Failed to check payment status'
      });
    }
  }
}

export default PaymentController;