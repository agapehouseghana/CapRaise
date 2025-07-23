// Simple in-memory cache middleware (no Redis dependency for now)
const NodeCache = require('node-cache');

// Create cache instance with 10 minute default TTL
const cache = new NodeCache({ 
  stdTTL: 600, // 10 minutes
  checkperiod: 120 // Check for expired keys every 2 minutes
});

// Cache middleware for GET requests
const cacheMiddleware = (duration = 300) => {
  return (req, res, next) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    // Skip caching for certain routes
    const skipCache = ['/health', '/api/auth'].some(route => 
      req.originalUrl.startsWith(route)
    );

    if (skipCache) {
      return next();
    }

    // Create cache key from URL and user ID
    const cacheKey = `${req.originalUrl}_${req.user?.uid || 'anonymous'}`;
    
    // Try to get from cache
    const cachedResponse = cache.get(cacheKey);
    
    if (cachedResponse) {
      console.log(`Cache HIT: ${cacheKey}`);
      return res.json(cachedResponse);
    }

    // Store original res.json method
    const originalJson = res.json;

    // Override res.json to cache the response
    res.json = function(data) {
      // Only cache successful responses
      if (res.statusCode === 200) {
        console.log(`Cache SET: ${cacheKey}`);
        cache.set(cacheKey, data, duration);
      }
      
      // Call original json method
      return originalJson.call(this, data);
    };

    next();
  };
};

// Clear cache for specific patterns
const clearCache = (pattern) => {
  const keys = cache.keys();
  const keysToDelete = keys.filter(key => key.includes(pattern));
  
  keysToDelete.forEach(key => {
    cache.del(key);
  });

  console.log(`Cleared ${keysToDelete.length} cache entries matching: ${pattern}`);
};

// Cache stats
const getCacheStats = () => {
  return {
    keys: cache.keys().length,
    hits: cache.getStats().hits,
    misses: cache.getStats().misses,
    hitRate: cache.getStats().hits / (cache.getStats().hits + cache.getStats().misses) || 0
  };
};

module.exports = {
  cacheMiddleware,
  clearCache,
  getCacheStats,
  cache
}; 