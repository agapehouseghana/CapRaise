const crypto = require('crypto');

/**
 * Webhook Authentication Middleware
 * Verifies HMAC-SHA256 signatures from payment providers (Kowri)
 */

const verifyWebhookSignature = (req, res, next) => {
  try {
    const signature = req.headers['x-kowri-signature'] || req.headers['x-signature'];
    const timestamp = req.headers['x-kowri-timestamp'] || req.headers['x-timestamp'];
    
    if (!signature) {
      return res.status(401).json({
        error: 'Missing signature',
        message: 'Webhook signature is required'
      });
    }

    if (!timestamp) {
      return res.status(401).json({
        error: 'Missing timestamp',
        message: 'Webhook timestamp is required'
      });
    }

    // Check timestamp to prevent replay attacks (5 minutes tolerance)
    const currentTime = Math.floor(Date.now() / 1000);
    const webhookTime = parseInt(timestamp);
    const timeDifference = Math.abs(currentTime - webhookTime);
    
    if (timeDifference > 300) { // 5 minutes
      return res.status(401).json({
        error: 'Request too old',
        message: 'Webhook timestamp is too old'
      });
    }

    // Get webhook secret from environment
    const webhookSecret = process.env.KOWRI_WEBHOOK_SECRET;
    
    if (!webhookSecret) {
      console.error('KOWRI_WEBHOOK_SECRET not configured');
      return res.status(500).json({
        error: 'Server configuration error',
        message: 'Webhook secret not configured'
      });
    }

    // Create expected signature
    const payload = JSON.stringify(req.body);
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(timestamp + '.' + payload)
      .digest('hex');

    // Compare signatures (timing-safe comparison)
    const providedSignature = signature.replace('sha256=', '');
    
    if (!crypto.timingSafeEqual(
      Buffer.from(expectedSignature, 'hex'),
      Buffer.from(providedSignature, 'hex')
    )) {
      console.warn('Webhook signature verification failed', {
        expected: expectedSignature,
        provided: providedSignature,
        timestamp,
        payload: payload.substring(0, 100) + '...'
      });
      
      return res.status(401).json({
        error: 'Invalid signature',
        message: 'Webhook signature verification failed'
      });
    }

    // Signature verified successfully
    req.webhookVerified = true;
    req.webhookTimestamp = webhookTime;
    next();

  } catch (error) {
    console.error('Webhook signature verification error:', error);
    return res.status(500).json({
      error: 'Verification failed',
      message: 'Unable to verify webhook signature'
    });
  }
};

/**
 * Generate a new webhook secret
 */
const generateWebhookSecret = () => {
  return crypto.randomBytes(32).toString('hex');
};

/**
 * Validate webhook payload structure
 */
const validateWebhookPayload = (req, res, next) => {
  const { body } = req;
  
  // Required fields for Kowri webhook
  const requiredFields = [
    'event_type',
    'timestamp',
    'transaction_id',
    'donation'
  ];

  const missingFields = requiredFields.filter(field => !body[field]);
  
  if (missingFields.length > 0) {
    return res.status(400).json({
      error: 'Invalid payload',
      message: `Missing required fields: ${missingFields.join(', ')}`
    });
  }

  // Validate donation object
  const donation = body.donation;
  const requiredDonationFields = ['amount', 'referral_code', 'service_code', 'donor'];
  
  const missingDonationFields = requiredDonationFields.filter(field => !donation[field]);
  
  if (missingDonationFields.length > 0) {
    return res.status(400).json({
      error: 'Invalid donation data',
      message: `Missing donation fields: ${missingDonationFields.join(', ')}`
    });
  }

  // Validate donor object
  const donor = donation.donor;
  if (!donor.name || !donor.phone) {
    return res.status(400).json({
      error: 'Invalid donor data',
      message: 'Donor name and phone are required'
    });
  }

  next();
};

module.exports = {
  verifyWebhookSignature,
  generateWebhookSecret,
  validateWebhookPayload
}; 