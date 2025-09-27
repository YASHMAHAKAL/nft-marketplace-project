const express = require('express');
const axios = require('axios');
const cors = require('cors');
const pool = require('./db');

const router = express.Router();
const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://ml-service:5000';

// Enable CORS for all ML routes
router.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// --- ML-powered Recommendation Routes ---

// Get NFT recommendations for a user
router.get('/recommendations/:address', async (req, res) => {
  try {
    // Get user's preferences and transaction history
    const userPreferences = await pool.query(
      `SELECT token_id, interaction_type 
       FROM user_preferences 
       WHERE wallet_address = $1 
       ORDER BY created_at DESC`,
      [req.params.address]
    );

    // For now, return the most recently interacted tokens as recommendations
    if (userPreferences.rows.length > 0) {
      // Return simplified recommendation format
      const recommendations = userPreferences.rows.slice(0, 5).map(pref => ({
        tokenId: parseInt(pref.token_id),
        similarity: 1,
        confidence: 0.8
      }));
      return res.json(recommendations);
    }

    // Get ML recommendations
    const response = await axios.post(`${ML_SERVICE_URL}/recommend`, {
      user_address: req.params.address,
      transaction_history: userHistory.rows
    });

    res.json(response.data);
  } catch (error) {
    console.error('Error getting recommendations:', error);
    res.status(500).json({ error: 'Failed to get recommendations' });
  }
});

// Update user preferences based on interactions
router.post('/preferences', async (req, res) => {
  try {
    const { walletAddress, tokenId } = req.body;
    
    // Log the interaction in the database
    await pool.query(
      `INSERT INTO user_preferences (wallet_address, token_id, interaction_type)
       VALUES ($1, $2, 'view')`,
      [walletAddress, tokenId]
    );

    // Update ML model
    await axios.post(`${ML_SERVICE_URL}/update-preferences`, {
      user_address: walletAddress,
      token_id: tokenId
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error updating preferences:', error);
    res.status(500).json({ error: 'Failed to update preferences' });
  }
});

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