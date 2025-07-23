const admin = require('firebase-admin');
const jwt = require('jsonwebtoken');

// Initialize Firebase Admin SDK only if credentials are available
let firebaseInitialized = false;
try {
  if (process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL) {
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        }),
        databaseURL: `https://${process.env.FIREBASE_PROJECT_ID}.firebaseio.com`
      });
    }
    firebaseInitialized = true;
    console.log('✅ Firebase Admin SDK initialized successfully');
  } else {
    console.log('⚠️  Firebase Admin SDK not initialized - missing credentials (testing mode)');
  }
} catch (error) {
  console.error('❌ Firebase Admin SDK initialization failed:', error.message);
  console.log('🔄 Running in testing mode without Firebase validation');
}

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'No valid authorization header provided'
      });
    }

    const token = authHeader.split(' ')[1];

    // If Firebase is not initialized, use mock user for testing
    if (!firebaseInitialized) {
      console.log('🧪 Using mock authentication for testing');
      req.user = {
        uid: 'test-user-123',
        email: 'test@example.com',
        role: 'admin',
        adminId: '3XXjbBVSIycV9IitM19W6i6W84y2',
        fullName: 'Test User'
      };
      return next();
    }

    // Verify Firebase ID token
    const decodedToken = await admin.auth().verifyIdToken(token);
    
    // Get user data from Firestore
    const userDoc = await admin.firestore()
      .collection('users')
      .doc(decodedToken.uid)
      .get();
    
    let userData = null;
    if (userDoc.exists) {
      userData = { id: userDoc.id, ...userDoc.data() };
    } else {
      // Check if user is an admin
      const adminDoc = await admin.firestore()
        .collection('admins')
        .doc(decodedToken.uid)
        .get();
      
      if (adminDoc.exists) {
        userData = { id: adminDoc.id, ...adminDoc.data(), role: 'admin' };
      }
    }

    if (!userData) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'User not found in database'
      });
    }

    // Attach user data to request
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      ...userData
    };

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    
    if (error.code === 'auth/id-token-expired') {
      return res.status(401).json({
        error: 'Token expired',
        message: 'Please sign in again'
      });
    }
    
    if (error.code === 'auth/invalid-id-token') {
      return res.status(401).json({
        error: 'Invalid token',
        message: 'Please sign in again'
      });
    }

    return res.status(500).json({
      error: 'Authentication error',
      message: 'Failed to authenticate request'
    });
  }
};

// Role-based authorization middleware
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required'
      });
    }

    const userRole = req.user.role || 'member';
    const allowedRoles = Array.isArray(roles) ? roles : [roles];

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        error: 'Forbidden',
        message: `Access denied. Required roles: ${allowedRoles.join(', ')}`
      });
    }

    next();
  };
};

// Admin-only middleware
const requireAdmin = requireRole(['admin', 'SuperAdmin']);

// SuperAdmin-only middleware
const requireSuperAdmin = requireRole(['SuperAdmin']);

module.exports = {
  authMiddleware,
  requireRole,
  requireAdmin,
  requireSuperAdmin,
  firebaseInitialized
}; 