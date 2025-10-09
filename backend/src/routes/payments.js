import express from 'express';
import PaymentController from '../controller/payment.controller.js';
import { attachTenantDb } from '../middleware/tenant-db.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = express.Router();

// Public test endpoint (no auth required)
router.get('/test', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Payment routes are working',
    timestamp: new Date().toISOString()
  });
});

// Public callback endpoint (no auth required)
router.post('/phonepe-callback', attachTenantDb, PaymentController.handlePhonePeCallback);

// Authenticated payment endpoints
router.post('/initiate', authenticate, attachTenantDb, PaymentController.initiatePayment);
router.get('/status/:merchantOrderId', authenticate, attachTenantDb, PaymentController.checkPaymentStatus);

export default router;