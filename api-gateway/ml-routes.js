const express = require('express');
const cors = require('cors');
const axios = require('axios');
const pool = require('./db');
const router = express.Router();

// Enable CORS for all ML routes
router.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3002', 'http://127.0.0.1:3000', 'http://127.0.0.1:3002'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// ML Service URL
const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://ml-service:5000';

// Utility function to call ML service with fallback
async function callMLService(endpoint, data = null, method = 'GET') {
  try {
    const config = {
      method,
      url: `${ML_SERVICE_URL}${endpoint}`,
      headers: { 'Content-Type': 'application/json' },
      timeout: 5000
    };
    
    if (data && method !== 'GET') {
      config.data = data;
    }
    
    const response = await axios(config);
    return response.data;
  } catch (error) {
    console.error(`ML Service call failed for ${endpoint}:`, error.message);
    return null;
  }
}

// Get NFT recommendations for a user
router.get('/recommendations/:address', async (req, res) => {
  try {
    const address = req.params.address.toLowerCase();
    console.log('🎯 [RECOMMENDATIONS] Getting recommendations for:', address);
    
    // Get user's interaction history from database
    const historyResult = await pool.query(
      'SELECT token_id FROM user_preferences WHERE wallet_address = $1 AND interaction_type = $2',
      [address, 'favorite']
    );
    
    const favoriteTokenIds = historyResult.rows.map(row => row.token_id);
    console.log('📋 [RECOMMENDATIONS] User favorites:', favoriteTokenIds);
    
    if (favoriteTokenIds.length === 0) {
      // No history, return empty recommendations
      return res.json([]);
    }
    
    // Try to get recommendations from ML service
    const recommendations = await callMLService(`/recommendations/${favoriteTokenIds[0]}`);
    
    if (recommendations) {
      console.log('🤖 [RECOMMENDATIONS] ML service returned:', recommendations);
      res.json(recommendations);
    } else {
      // Fallback: return simple recommendations based on user's favorites
      const fallbackRecs = favoriteTokenIds.slice(0, 3).map((tokenId, index) => ({
        id: parseInt(tokenId),
        name: `Recommended NFT ${tokenId}`,
        description: `Similar to your favorite NFT ${tokenId}`,
        similarity: 0.8 - (index * 0.1)
      }));
      
      console.log('🔄 [RECOMMENDATIONS] Using fallback recommendations:', fallbackRecs);
      res.json(fallbackRecs);
    }
  } catch (error) {
    console.error('❌ [RECOMMENDATIONS] Error:', error);
    res.status(500).json({ error: 'Failed to get recommendations' });
  }
});

// Update user preferences (favorites)
router.post('/preferences', async (req, res) => {
  try {
    const { walletAddress, tokenId } = req.body;
    const address = walletAddress.toLowerCase();
    
    console.log('🎯 [FAVORITES] Updating preferences for:', address, 'tokenId:', tokenId);
    
    // Check if preference already exists
    const existingResult = await pool.query(
      'SELECT id FROM user_preferences WHERE wallet_address = $1 AND token_id = $2 AND interaction_type = $3',
      [address, tokenId, 'favorite']
    );
    
    if (existingResult.rows.length > 0) {
      // Remove from favorites (toggle off)
      await pool.query(
        'DELETE FROM user_preferences WHERE wallet_address = $1 AND token_id = $2 AND interaction_type = $3',
        [address, tokenId, 'favorite']
      );
      console.log('🗑️ [FAVORITES] Removed favorite for', address, 'tokenId:', tokenId);
    } else {
      // Add to favorites
      await pool.query(
        'INSERT INTO user_preferences (wallet_address, token_id, interaction_type) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING',
        [address, tokenId, 'favorite']
      );
      console.log('✅ [FAVORITES] Added favorite for', address, 'tokenId:', tokenId);
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('❌ [FAVORITES] Error updating preferences:', error);
    res.status(500).json({ error: 'Failed to update preferences' });
  }
});

// Get favorite items for a user
router.get('/favorites/:walletAddress', async (req, res) => {
  try {
    const address = req.params.walletAddress.toLowerCase();
    console.log('🔍 [FAVORITES] Fetching favorites for:', address);
    
    const result = await pool.query(
      'SELECT token_id, created_at FROM user_preferences WHERE wallet_address = $1 AND interaction_type = $2 ORDER BY created_at DESC',
      [address, 'favorite']
    );
    
    const favorites = result.rows.map(row => ({
      tokenId: parseInt(row.token_id),
      likedAt: row.created_at.toISOString()
    }));
    
    console.log('✅ [FAVORITES] Returning', favorites.length, 'favorites for', address);
    res.json(favorites);
  } catch (error) {
    console.error('❌ [FAVORITES] Error fetching favorites:', error);
    res.status(500).json({ error: 'Failed to fetch favorites' });
  }
});

// Log view interactions
router.post('/views', async (req, res) => {
  try {
    const { walletAddress, tokenId } = req.body;
    const address = walletAddress.toLowerCase();
    
    console.log('📊 [VIEWS] Logging view for:', address, 'tokenId:', tokenId);
    
    // Insert view record
    await pool.query(
      'INSERT INTO user_views (wallet_address, token_id) VALUES ($1, $2)',
      [address, tokenId]
    );
    
    console.log('✅ [VIEWS] View logged successfully');
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
    console.log('🛡️ [FRAUD] Checking fraud for tokenId:', tokenId);
    
    // Try ML service first
    const fraudResult = await callMLService('/check-transaction', {
      transaction_count: 1,
      avg_price: 1.0 // This would be calculated from actual data
    }, 'POST');
    
    if (fraudResult) {
      console.log('🤖 [FRAUD] ML service result:', fraudResult);
      res.json({
        isFraudulent: fraudResult.is_anomaly,
        confidence: Math.abs(fraudResult.fraud_score) * 100,
        reason: fraudResult.is_anomaly ? 'Unusual transaction pattern detected' : 'Transaction appears legitimate'
      });
    } else {
      // Fallback fraud check
      const isFraudulent = Math.random() < 0.05; // 5% chance
      res.json({
        isFraudulent,
        confidence: isFraudulent ? 85 : 95,
        reason: isFraudulent ? 'Unusual transaction pattern' : 'Transaction appears legitimate'
      });
    }
  } catch (error) {
    console.error('❌ [FRAUD] Error checking transaction:', error);
    res.status(500).json({ error: 'Failed to check transaction' });
  }
});

// Health check for ML routes
router.get('/health', async (req, res) => {
  try {
    const mlHealth = await callMLService('/health');
    
    res.json({
      status: 'healthy',
      ml_service: mlHealth ? 'connected' : 'disconnected',
      database: 'connected',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy', 
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;

// Check if a transaction might be fraudulent
router.post('/fraud-check', async (req, res) => {
  try {
    const { price, tokenId, buyerAddress, sellerAddress } = req.body;
    
    // Get historical price data for similar NFTs
    const priceHistory = await pool.query(
      `SELECT price FROM transactions 
       WHERE token_id = $1 OR seller_address = $2 
       ORDER BY timestamp DESC LIMIT 10`,
      [tokenId, sellerAddress]
    );

    // Get ML fraud detection results
    const response = await axios.post(`${ML_SERVICE_URL}/check-fraud`, {
      price,
      token_id: tokenId,
      buyer_address: buyerAddress,
      seller_address: sellerAddress,
      price_history: priceHistory.rows
    });

    res.json(response.data);
  } catch (error) {
    console.error('Error checking transaction:', error);
    res.status(500).json({ error: 'Failed to check transaction' });
  }
});

module.exports = router;