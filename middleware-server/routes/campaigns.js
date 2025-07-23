const express = require('express');
const admin = require('firebase-admin');
const { body, validationResult } = require('express-validator');
const { requireAdmin } = require('../middleware/auth');
const router = express.Router();

const db = admin.firestore();

// Validation rules
const campaignValidation = [
  body('campaignName').notEmpty().withMessage('Campaign name is required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('fundraisingGoal').isNumeric().withMessage('Fundraising goal must be a number'),
  body('serviceCode').notEmpty().withMessage('Service code is required'),
  body('endDate').isISO8601().withMessage('End date must be a valid date')
];

// GET /api/campaigns - Get all campaigns for authenticated user's admin
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, status, search } = req.query;
    const adminId = req.user.adminId || req.user.uid;

    let query = db.collection('campaigns').where('adminId', '==', adminId);

    // Filter by status
    if (status) {
      const now = new Date();
      if (status === 'active') {
        query = query.where('endDate', '>', now);
      } else if (status === 'ended') {
        query = query.where('endDate', '<=', now);
      }
    }

    const snapshot = await query.get();

    let campaigns = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      // Filter by search term if provided
      if (!search || 
          data.campaignName?.toLowerCase().includes(search.toLowerCase()) ||
          data.description?.toLowerCase().includes(search.toLowerCase())) {
        campaigns.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt && typeof data.createdAt.toDate === 'function' 
            ? data.createdAt.toDate() 
            : data.createdAt,
          endDate: data.endDate && typeof data.endDate.toDate === 'function' 
            ? data.endDate.toDate() 
            : data.endDate
        });
      }
    });

    // Sort by createdAt in memory
    campaigns.sort((a, b) => {
      const dateA = a.createdAt ? (typeof a.createdAt === 'string' ? new Date(a.createdAt) : a.createdAt) : new Date(0);
      const dateB = b.createdAt ? (typeof b.createdAt === 'string' ? new Date(b.createdAt) : b.createdAt) : new Date(0);
      return dateB - dateA; // desc order
    });

    // Apply pagination in memory
    const startIndex = (parseInt(page) - 1) * parseInt(limit);
    const endIndex = startIndex + parseInt(limit);
    const paginatedCampaigns = campaigns.slice(startIndex, endIndex);

    res.json({
      campaigns: paginatedCampaigns,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: campaigns.length, // total before pagination
        pages: Math.ceil(campaigns.length / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    res.status(500).json({
      error: 'Failed to fetch campaigns',
      message: error.message
    });
  }
});

// GET /api/campaigns/:id - Get single campaign
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const campaignDoc = await db.collection('campaigns').doc(id).get();

    if (!campaignDoc.exists) {
      return res.status(404).json({
        error: 'Campaign not found'
      });
    }

    const campaign = campaignDoc.data();
    const adminId = req.user.adminId || req.user.uid;

    // Check if user has access to this campaign
    if (campaign.adminId !== adminId && req.user.role !== 'SuperAdmin') {
      return res.status(403).json({
        error: 'Access denied to this campaign'
      });
    }

    res.json({
      id: campaignDoc.id,
      ...campaign,
      createdAt: campaign.createdAt?.toDate(),
      endDate: campaign.endDate?.toDate()
    });
  } catch (error) {
    console.error('Error fetching campaign:', error);
    res.status(500).json({
      error: 'Failed to fetch campaign',
      message: error.message
    });
  }
});

// POST /api/campaigns - Create new campaign (Admin only)
router.post('/', requireAdmin, campaignValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const {
      campaignName,
      description,
      fundraisingGoal,
      currentProgress = 0,
      serviceCode,
      endDate,
      imagesURL = []
    } = req.body;

    const adminId = req.user.adminId || req.user.uid;

    // Check if service code already exists
    const existingCampaign = await db.collection('campaigns')
      .where('serviceCode', '==', serviceCode)
      .get();

    if (!existingCampaign.empty) {
      return res.status(400).json({
        error: 'Service code already exists',
        message: 'Please choose a different service code'
      });
    }

    const campaignData = {
      campaignName,
      description,
      fundraisingGoal: parseFloat(fundraisingGoal),
      currentProgress: parseFloat(currentProgress),
      serviceCode,
      adminId,
      endDate: new Date(endDate),
      imagesURL,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: req.user.uid
    };

    const docRef = await db.collection('campaigns').add(campaignData);

    res.status(201).json({
      id: docRef.id,
      ...campaignData,
      message: 'Campaign created successfully'
    });
  } catch (error) {
    console.error('Error creating campaign:', error);
    res.status(500).json({
      error: 'Failed to create campaign',
      message: error.message
    });
  }
});

// PUT /api/campaigns/:id - Update campaign (Admin only)
router.put('/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const campaignRef = db.collection('campaigns').doc(id);
    const campaignDoc = await campaignRef.get();

    if (!campaignDoc.exists) {
      return res.status(404).json({
        error: 'Campaign not found'
      });
    }

    const campaign = campaignDoc.data();
    const adminId = req.user.adminId || req.user.uid;

    // Check if user has access to update this campaign
    if (campaign.adminId !== adminId && req.user.role !== 'SuperAdmin') {
      return res.status(403).json({
        error: 'Access denied to update this campaign'
      });
    }

    const updateData = {
      ...req.body,
      updatedAt: new Date(),
      updatedBy: req.user.uid
    };

    // Convert dates if provided
    if (updateData.endDate) {
      updateData.endDate = new Date(updateData.endDate);
    }

    // Convert numbers if provided
    if (updateData.fundraisingGoal) {
      updateData.fundraisingGoal = parseFloat(updateData.fundraisingGoal);
    }
    if (updateData.currentProgress) {
      updateData.currentProgress = parseFloat(updateData.currentProgress);
    }

    await campaignRef.update(updateData);

    res.json({
      id,
      message: 'Campaign updated successfully'
    });
  } catch (error) {
    console.error('Error updating campaign:', error);
    res.status(500).json({
      error: 'Failed to update campaign',
      message: error.message
    });
  }
});

// DELETE /api/campaigns/:id - Delete campaign (Admin only)
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const campaignRef = db.collection('campaigns').doc(id);
    const campaignDoc = await campaignRef.get();

    if (!campaignDoc.exists) {
      return res.status(404).json({
        error: 'Campaign not found'
      });
    }

    const campaign = campaignDoc.data();
    const adminId = req.user.adminId || req.user.uid;

    // Check if user has access to delete this campaign
    if (campaign.adminId !== adminId && req.user.role !== 'SuperAdmin') {
      return res.status(403).json({
        error: 'Access denied to delete this campaign'
      });
    }

    await campaignRef.delete();

    res.json({
      message: 'Campaign deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting campaign:', error);
    res.status(500).json({
      error: 'Failed to delete campaign',
      message: error.message
    });
  }
});

// GET /api/campaigns/:id/analytics - Get campaign analytics
router.get('/:id/analytics', async (req, res) => {
  try {
    const { id } = req.params;
    const campaignDoc = await db.collection('campaigns').doc(id).get();

    if (!campaignDoc.exists) {
      return res.status(404).json({
        error: 'Campaign not found'
      });
    }

    const campaign = campaignDoc.data();
    const adminId = req.user.adminId || req.user.uid;

    // Check access
    if (campaign.adminId !== adminId && req.user.role !== 'SuperAdmin') {
      return res.status(403).json({
        error: 'Access denied to this campaign analytics'
      });
    }

    // This would integrate with your external donation API
    // For now, returning mock analytics structure
    const analytics = {
      campaignId: id,
      serviceCode: campaign.serviceCode,
      totalRaised: campaign.currentProgress || 0,
      donorCount: 0,
      averageDonation: 0,
      progressPercentage: campaign.fundraisingGoal ? 
        ((campaign.currentProgress || 0) / campaign.fundraisingGoal) * 100 : 0,
      daysRemaining: campaign.endDate ? 
        Math.max(0, Math.ceil((campaign.endDate.toDate() - new Date()) / (1000 * 60 * 60 * 24))) : null,
      recentDonations: [], // Would be populated from external API
      topFundraisers: [] // Would be populated from external API
    };

    res.json(analytics);
  } catch (error) {
    console.error('Error fetching campaign analytics:', error);
    res.status(500).json({
      error: 'Failed to fetch campaign analytics',
      message: error.message
    });
  }
});

module.exports = router; 