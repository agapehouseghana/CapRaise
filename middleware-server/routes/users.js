const express = require('express');
const admin = require('firebase-admin');
const { requireAdmin } = require('../middleware/auth');
const router = express.Router();

const db = admin.firestore();

// GET /api/users - Get users linked to admin (paginated)
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 50, search, role } = req.query;
    const adminId = req.user.adminId || req.user.uid;

    // If role=admin is requested, fetch from admins collection
    if (role === 'admin') {
      // Get total count first
      const totalSnapshot = await db.collection('admins').get();
      
      let query = db.collection('admins')
        .limit(parseInt(limit))
        .offset((parseInt(page) - 1) * parseInt(limit));
      
      const snapshot = await query.get();

      let users = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        // Filter by search term if provided
        if (!search || 
            data.fullName?.toLowerCase().includes(search.toLowerCase()) ||
            data.email?.toLowerCase().includes(search.toLowerCase()) ||
            data.churchName?.toLowerCase().includes(search.toLowerCase())) {
          users.push({
            id: doc.id,
            adminId: doc.id, // For compatibility
            ...data
          });
        }
      });

      return res.json({
        users,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: totalSnapshot.size,
          pages: Math.ceil(totalSnapshot.size / parseInt(limit))
        }
      });
    }

    // Get total count for regular users
    const totalSnapshot = await db.collection('users')
      .where('adminId', '==', adminId)
      .get();

    // Get paginated results
    let query = db.collection('users').where('adminId', '==', adminId);
    
    const snapshot = await query
      .limit(parseInt(limit))
      .offset((parseInt(page) - 1) * parseInt(limit))
      .get();

    let users = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      // Filter by search term if provided
      if (!search || 
          data.fullName?.toLowerCase().includes(search.toLowerCase()) ||
          data.email?.toLowerCase().includes(search.toLowerCase()) ||
          data.phoneNumber?.includes(search)) {
        users.push({
          id: doc.id,
          ...data
        });
      }
    });

    res.json({
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalSnapshot.size,
        pages: Math.ceil(totalSnapshot.size / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      error: 'Failed to fetch users',
      message: error.message
    });
  }
});

// GET /api/users/:id - Get single user
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userDoc = await db.collection('users').doc(id).get();

    if (!userDoc.exists) {
      return res.status(404).json({
        error: 'User not found'
      });
    }

    const user = userDoc.data();
    const adminId = req.user.adminId || req.user.uid;

    // Check if user belongs to this admin or if user is SuperAdmin
    if (user.adminId !== adminId && req.user.role !== 'SuperAdmin') {
      return res.status(403).json({
        error: 'Access denied to this user'
      });
    }

    res.json({
      id: userDoc.id,
      ...user
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({
      error: 'Failed to fetch user',
      message: error.message
    });
  }
});

// PUT /api/users/:id - Update user (Admin only)
router.put('/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const userRef = db.collection('users').doc(id);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return res.status(404).json({
        error: 'User not found'
      });
    }

    const user = userDoc.data();
    const adminId = req.user.adminId || req.user.uid;

    // Check access
    if (user.adminId !== adminId && req.user.role !== 'SuperAdmin') {
      return res.status(403).json({
        error: 'Access denied to update this user'
      });
    }

    const updateData = {
      ...req.body,
      updatedAt: new Date(),
      updatedBy: req.user.uid
    };

    // Remove sensitive fields that shouldn't be updated via API
    delete updateData.uid;
    delete updateData.adminId;
    delete updateData.referalCode;

    await userRef.update(updateData);

    res.json({
      id,
      message: 'User updated successfully'
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({
      error: 'Failed to update user',
      message: error.message
    });
  }
});

// GET /api/users/:id/stats - Get user fundraising statistics
router.get('/:id/stats', async (req, res) => {
  try {
    const { id } = req.params;
    const userDoc = await db.collection('users').doc(id).get();

    if (!userDoc.exists) {
      return res.status(404).json({
        error: 'User not found'
      });
    }

    const user = userDoc.data();
    const adminId = req.user.adminId || req.user.uid;

    // Check access
    if (user.adminId !== adminId && req.user.role !== 'SuperAdmin') {
      return res.status(403).json({
        error: 'Access denied to this user stats'
      });
    }

    // This would integrate with your external donation API
    // For now, returning mock stats structure
    const stats = {
      userId: id,
      referalCode: user.referalCode,
      totalRaised: 0,
      donorCount: 0,
      campaignCount: 0,
      averageDonation: 0,
      topCampaign: null,
      recentActivity: [], // Would be populated from external API
      monthlyStats: [] // Would be populated from external API
    };

    res.json(stats);
  } catch (error) {
    console.error('Error fetching user stats:', error);
    res.status(500).json({
      error: 'Failed to fetch user stats',
      message: error.message
    });
  }
});

module.exports = router; 