const express = require('express');
const admin = require('firebase-admin');
const { verifyWebhookSignature, validateWebhookPayload, generateWebhookSecret } = require('../middleware/webhookAuth');
const { authMiddleware, requireAdmin } = require('../middleware/auth');
const router = express.Router();

const db = admin.firestore();

// POST /api/webhooks/donations - Handle donation webhooks from Kowri (NO AUTH REQUIRED)
router.post('/donations', verifyWebhookSignature, validateWebhookPayload, async (req, res) => {
  try {
    const { event_type, timestamp, transaction_id, donation } = req.body;

    console.log('📥 Webhook received:', {
      event_type,
      transaction_id,
      amount: donation.amount,
      referral_code: donation.referral_code
    });

    // Check for duplicate transactions
    const existingDonation = await db.collection('donations')
      .where('transactionId', '==', transaction_id)
      .limit(1)
      .get();

    if (!existingDonation.empty) {
      console.log('⚠️ Duplicate transaction detected:', transaction_id);
      return res.status(200).json({
        success: true,
        message: 'Transaction already processed',
        transaction_id
      });
    }

    // Validate referral code exists
    const fundraiserQuery = await db.collection('users')
      .where('referalCode', '==', donation.referral_code)
      .limit(1)
      .get();

    if (fundraiserQuery.empty) {
      console.warn('❌ Invalid referral code:', donation.referral_code);
      return res.status(400).json({
        error: 'Invalid referral code',
        message: 'Fundraiser not found'
      });
    }

    const fundraiser = fundraiserQuery.docs[0].data();
    const fundraiserId = fundraiserQuery.docs[0].id;

    // Validate service code exists
    const campaignQuery = await db.collection('campaigns')
      .where('serviceCode', '==', donation.service_code)
      .limit(1)
      .get();

    if (campaignQuery.empty) {
      console.warn('❌ Invalid service code:', donation.service_code);
      return res.status(400).json({
        error: 'Invalid service code',
        message: 'Campaign not found'
      });
    }

    const campaign = campaignQuery.docs[0].data();
    const campaignId = campaignQuery.docs[0].id;

    // Create donation record
    const donationData = {
      transactionId: transaction_id,
      eventType: event_type,
      amount: donation.amount,
      currency: donation.currency || 'GHS',
      referralCode: donation.referral_code,
      serviceCode: donation.service_code,
      
      // Fundraiser info
      fundraiserId,
      fundraiserName: fundraiser.fullName,
      fundraiserEmail: fundraiser.email,
      
      // Campaign info
      campaignId,
      campaignName: campaign.campaignName || campaign.title,
      
      // Donor info
      donorName: donation.donor.name,
      donorPhone: donation.donor.phone,
      donorEmail: donation.donor.email || null,
      
      // Payment info
      paymentMethod: donation.payment?.method || 'mobile_money',
      paymentProvider: donation.payment?.provider || 'kowri',
      paymentReference: donation.payment?.reference || transaction_id,
      
      // Status and timestamps
      status: 'completed',
      webhookTimestamp: new Date(timestamp),
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      processedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    // Save donation to Firestore
    const donationRef = await db.collection('donations').add(donationData);
    console.log('✅ Donation saved:', donationRef.id);

    // Update campaign progress (optional - if you track progress in campaign document)
    try {
      await db.collection('campaigns').doc(campaignId).update({
        currentProgress: admin.firestore.FieldValue.increment(donation.amount),
        lastDonation: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      console.log('✅ Campaign progress updated');
    } catch (campaignUpdateError) {
      console.warn('⚠️ Failed to update campaign progress:', campaignUpdateError.message);
    }

    // TODO: Send real-time notification to fundraiser
    // TODO: Update cached statistics
    // TODO: Trigger any other business logic

    // Log successful processing
    await db.collection('webhook_logs').add({
      type: 'donation_webhook',
      status: 'success',
      transactionId: transaction_id,
      fundraiserId,
      campaignId,
      amount: donation.amount,
      processedAt: admin.firestore.FieldValue.serverTimestamp(),
      metadata: {
        event_type,
        referral_code: donation.referral_code,
        service_code: donation.service_code
      }
    });

    res.status(200).json({
      success: true,
      message: 'Donation processed successfully',
      transaction_id,
      donation_id: donationRef.id
    });

  } catch (error) {
    console.error('❌ Webhook processing error:', error);

    // Log failed processing
    try {
      await db.collection('webhook_logs').add({
        type: 'donation_webhook',
        status: 'error',
        transactionId: req.body.transaction_id,
        error: error.message,
        payload: req.body,
        processedAt: admin.firestore.FieldValue.serverTimestamp()
      });
    } catch (logError) {
      console.error('Failed to log webhook error:', logError);
    }

    res.status(500).json({
      error: 'Processing failed',
      message: 'Unable to process donation webhook'
    });
  }
});

// GET /api/webhooks/logs - Get webhook processing logs (Admin only)
router.get('/logs', authMiddleware, requireAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 50, status, type = 'donation_webhook' } = req.query;

    // Simplified query to avoid index requirements
    let query = db.collection('webhook_logs');
    
    // Only filter by type if it's not the default
    if (type && type !== 'donation_webhook') {
      query = query.where('type', '==', type);
    }
    
    // If status filter is provided, add it
    if (status) {
      query = query.where('status', '==', status);
    }

    // Get all matching documents first (without orderBy to avoid index requirement)
    const snapshot = await query.get();

    let logs = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      logs.push({
        id: doc.id,
        ...data,
        processedAt: data.processedAt?.toDate()
      });
    });

    // Sort in memory by processedAt (newest first)
    logs.sort((a, b) => {
      const dateA = a.processedAt || new Date(0);
      const dateB = b.processedAt || new Date(0);
      return dateB - dateA;
    });

    // Apply pagination in memory
    const startIndex = (parseInt(page) - 1) * parseInt(limit);
    const endIndex = startIndex + parseInt(limit);
    const paginatedLogs = logs.slice(startIndex, endIndex);

    res.json({
      logs: paginatedLogs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: logs.length,
        pages: Math.ceil(logs.length / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('Error fetching webhook logs:', error);
    res.status(500).json({
      error: 'Failed to fetch logs',
      message: error.message
    });
  }
});

// POST /api/webhooks/secret/generate - Generate new webhook secret (Admin only)
router.post('/secret/generate', authMiddleware, requireAdmin, async (req, res) => {
  try {
    const newSecret = generateWebhookSecret();
    
    // Store in a secure configuration collection
    await db.collection('webhook_config').doc('kowri').set({
      secret: newSecret,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      createdBy: req.user.uid
    });

    console.log('🔑 New webhook secret generated by:', req.user.email);

    res.json({
      success: true,
      message: 'New webhook secret generated',
      secret: newSecret,
      note: 'Please update your environment variable KOWRI_WEBHOOK_SECRET'
    });

  } catch (error) {
    console.error('Error generating webhook secret:', error);
    res.status(500).json({
      error: 'Failed to generate secret',
      message: error.message
    });
  }
});

// GET /api/webhooks/secret - Get current webhook secret info (Admin only)
router.get('/secret', authMiddleware, requireAdmin, async (req, res) => {
  try {
    let configDoc = await db.collection('webhook_config').doc('kowri').get();
    
    // If no config exists, create one from environment variable
    if (!configDoc.exists) {
      const envSecret = process.env.KOWRI_WEBHOOK_SECRET;
      
      if (!envSecret) {
        return res.status(404).json({
          error: 'No webhook secret configured',
          message: 'Generate a webhook secret first or set KOWRI_WEBHOOK_SECRET environment variable'
        });
      }

      // Create config from environment variable
      await db.collection('webhook_config').doc('kowri').set({
        secret: envSecret,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        createdBy: 'system',
        source: 'environment'
      });

      console.log('🔑 Webhook secret initialized from environment variable');
      
      // Fetch the newly created config
      configDoc = await db.collection('webhook_config').doc('kowri').get();
    }

    const config = configDoc.data();
    
    res.json({
      exists: true,
      createdAt: config.createdAt?.toDate(),
      createdBy: config.createdBy,
      source: config.source || 'manual',
      secret: config.secret, // In production, you might want to hide this
      note: 'Ensure KOWRI_WEBHOOK_SECRET environment variable is set'
    });

  } catch (error) {
    console.error('Error fetching webhook secret:', error);
    res.status(500).json({
      error: 'Failed to fetch secret info',
      message: error.message
    });
  }
});

// GET /api/webhooks/test - Test webhook endpoint (for development)
router.get('/test', (req, res) => {
  res.json({
    message: 'Webhook endpoint is active',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

module.exports = router; 