const express = require('express');
const admin = require('firebase-admin');
const { body, validationResult } = require('express-validator');
const router = express.Router();

const db = admin.firestore();

// POST /api/auth/validate-token - Validate Firebase ID token
router.post('/validate-token', async (req, res) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({
        error: 'Token required',
        message: 'ID token is required for validation'
      });
    }

    // Verify the ID token
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    
    // Get user data from Firestore
    const userDoc = await db.collection('users').doc(decodedToken.uid).get();
    let userData = null;
    
    if (userDoc.exists) {
      userData = { id: userDoc.id, ...userDoc.data() };
    } else {
      // Check if user is an admin
      const adminDoc = await db.collection('admins').doc(decodedToken.uid).get();
      if (adminDoc.exists) {
        userData = { id: adminDoc.id, ...adminDoc.data(), role: 'admin' };
      }
    }

    if (!userData) {
      return res.status(404).json({
        error: 'User not found',
        message: 'User does not exist in database'
      });
    }

    res.json({
      valid: true,
      user: {
        uid: decodedToken.uid,
        email: decodedToken.email,
        ...userData
      }
    });

  } catch (error) {
    console.error('Token validation error:', error);
    
    if (error.code === 'auth/id-token-expired') {
      return res.status(401).json({
        error: 'Token expired',
        message: 'Please sign in again'
      });
    }
    
    if (error.code === 'auth/invalid-id-token') {
      return res.status(401).json({
        error: 'Invalid token',
        message: 'Token is invalid or malformed'
      });
    }

    res.status(500).json({
      error: 'Validation failed',
      message: 'Unable to validate token'
    });
  }
});

// GET /api/auth/me - Get current user info (requires auth)
router.get('/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'No valid authorization header provided'
      });
    }

    const token = authHeader.split(' ')[1];
    const decodedToken = await admin.auth().verifyIdToken(token);
    
    // Get fresh user data
    const userDoc = await db.collection('users').doc(decodedToken.uid).get();
    let userData = null;
    
    if (userDoc.exists) {
      userData = { id: userDoc.id, ...userDoc.data() };
    } else {
      const adminDoc = await db.collection('admins').doc(decodedToken.uid).get();
      if (adminDoc.exists) {
        userData = { id: adminDoc.id, ...adminDoc.data(), role: 'admin' };
      }
    }

    if (!userData) {
      return res.status(404).json({
        error: 'User not found'
      });
    }

    res.json({
      uid: decodedToken.uid,
      email: decodedToken.email,
      ...userData
    });

  } catch (error) {
    console.error('Get user error:', error);
    res.status(401).json({
      error: 'Authentication failed',
      message: 'Unable to get user information'
    });
  }
});

// POST /api/auth/refresh-claims - Refresh user custom claims
router.post('/refresh-claims', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Unauthorized'
      });
    }

    const token = authHeader.split(' ')[1];
    const decodedToken = await admin.auth().verifyIdToken(token);
    
    // Get user role from database
    let role = 'member';
    const userDoc = await db.collection('users').doc(decodedToken.uid).get();
    
    if (userDoc.exists) {
      role = userDoc.data().role || 'member';
    } else {
      const adminDoc = await db.collection('admins').doc(decodedToken.uid).get();
      if (adminDoc.exists) {
        role = adminDoc.data().role || 'admin';
      }
    }

    // Set custom claims
    await admin.auth().setCustomUserClaims(decodedToken.uid, { role });

    res.json({
      message: 'Claims refreshed successfully',
      role
    });

  } catch (error) {
    console.error('Refresh claims error:', error);
    res.status(500).json({
      error: 'Failed to refresh claims',
      message: error.message
    });
  }
});

module.exports = router; 