const express = require('express');
const cors = require('cors');
const router = express.Router();

// Enable CORS for all ML routes
router.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3002', 'http://127.0.0.1:3000', 'http://127.0.0.1:3002'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Mock data store (in-memory for testing)
const userPreferences = new Map();

// Get NFT recommendations for a user
router.get('/recommendations/:address', async (req, res) => {
  try {
    const address = req.params.address;
    console.log('Getting recommendations for:', address);
    
    // Mock recommendations based on stored preferences
    const preferences = userPreferences.get(address) || [];
    
    if (preferences.length > 0) {
      // Return some of the tokens the user has interacted with as recommendations
      const recommendations = preferences.slice(0, 3).map((tokenId, index) => ({
        tokenId: parseInt(tokenId),
        similarity: 0.9 - (index * 0.1),
        confidence: 0.8 + (index * 0.05)
      }));
      
      console.log('Returning recommendations:', recommendations);
      return res.json(recommendations);
    }
    
    // Return empty array if no preferences
    res.json([]);
  } catch (error) {
    console.error('Error getting recommendations:', error);
    res.status(500).json({ error: 'Failed to get recommendations' });
  }
});

// Update user preferences based on interactions
router.post('/preferences', async (req, res) => {
  try {
    const { walletAddress, tokenId } = req.body;
    console.log('🎯 [FAVORITES] Updating preferences for:', walletAddress, 'tokenId:', tokenId);
    
    // Store preference in memory
    if (!userPreferences.has(walletAddress)) {
      userPreferences.set(walletAddress, []);
    }
    
    const preferences = userPreferences.get(walletAddress);
    if (!preferences.includes(tokenId)) {
      // Add to favorites
      preferences.push(tokenId);
      userPreferences.set(walletAddress, preferences);
      console.log('✅ [FAVORITES] Added new favorite. Total favorites for', walletAddress, ':', preferences);
    } else {
      // Remove from favorites (toggle behavior)
      const updatedPreferences = preferences.filter(id => id !== tokenId);
      userPreferences.set(walletAddress, updatedPreferences);
      console.log('🗑️ [FAVORITES] Removed favorite. Total favorites for', walletAddress, ':', updatedPreferences);
    }
    
    console.log('🗄️ [FAVORITES] All stored preferences:', Array.from(userPreferences.entries()));
    res.json({ success: true });
  } catch (error) {
    console.error('❌ [FAVORITES] Error updating preferences:', error);
    res.status(500).json({ error: 'Failed to update preferences' });
  }
});

// Get favorite items for a user
router.get('/favorites/:walletAddress', async (req, res) => {
  try {
    const { walletAddress } = req.params;
    console.log('🔍 [FAVORITES] Fetching favorites for:', walletAddress);
    
    const favorites = userPreferences.get(walletAddress) || [];
    console.log('📋 [FAVORITES] Found favorites:', favorites, 'for address:', walletAddress);
    console.log('🗄️ [FAVORITES] All stored data:', Array.from(userPreferences.entries()));
    
    // Return favorites in the format expected by the frontend
    const favoriteData = favorites.map(tokenId => ({
      tokenId: parseInt(tokenId),
      likedAt: new Date().toISOString()
    }));
    
    console.log('✅ [FAVORITES] Returning', favoriteData.length, 'favorites in expected format');
    res.json(favoriteData);
  } catch (error) {
    console.error('❌ [FAVORITES] Error fetching favorites:', error);
    res.status(500).json({ error: 'Failed to fetch favorites' });
  }
});

// Log view interactions (separate from favorites)
router.post('/views', async (req, res) => {
  try {
    const { walletAddress, tokenId } = req.body;
    console.log('📊 [VIEWS] Logging view for:', walletAddress, 'tokenId:', tokenId);
    
    // TODO: Implement view tracking logic here
    // This should be separate from favorites and used for analytics/recommendations
    
    res.json({ success: true });
  } catch (error) {
    console.error('❌ [VIEWS] Error logging view:', error);
    res.status(500).json({ error: 'Failed to log view' });
  }
});

// Check if a transaction might be fraudulent
router.post('/fraud-check', async (req, res) => {
  try {
    const { tokenId } = req.body;
    console.log('Fraud check for tokenId:', tokenId);
    
    // Mock fraud check - randomly return results for testing
    const isFraudulent = Math.random() < 0.1; // 10% chance of being flagged
    
    res.json({
      isFraudulent,
      confidence: isFraudulent ? 0.85 : 0.95,
      reason: isFraudulent ? 'Unusual price pattern detected' : 'Transaction appears legitimate'
    });
  } catch (error) {
    console.error('Error checking transaction:', error);
    res.status(500).json({ error: 'Failed to check transaction' });
  }
});

module.exports = router;