const express = require('express');
const cors = require('cors');
const { ethers } = require('ethers');
const jwt = require('jsonwebtoken');
const { randomBytes } = require('crypto');
const pool = require('./db');

const app = express();
const port = 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key'; // Use env var in production

// Import routes
const mlRoutes = require('./ml-routes-mock'); // Using mock routes for now

// Configure CORS
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3002', 'http://127.0.0.1:3000', 'http://127.0.0.1:3002'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json());

// Database temporarily disabled for testing
// Test database connection
// pool.query('SELECT NOW()', (err, res) => {
//   if (err) {
//     console.error('Error connecting to the database:', err);
//   } else {
//     console.log('Database connected successfully');
//   }
// });

// Create necessary tables
const setupDatabase = async () => {
  try {
    // Create user_preferences table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_preferences (
        id SERIAL PRIMARY KEY,
        wallet_address VARCHAR(42) NOT NULL,
        token_id VARCHAR(255) NOT NULL,
        interaction_type VARCHAR(50) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(wallet_address, token_id)
      );
    `);

    // Create transactions table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS transactions (
        id SERIAL PRIMARY KEY,
        token_id VARCHAR(255) NOT NULL,
        buyer_address VARCHAR(42),
        seller_address VARCHAR(42),
        price NUMERIC,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('Database tables created successfully');
  } catch (error) {
    console.error('Error setting up database:', error);
  }
};

// Mount ML routes
app.use('/ml', mlRoutes);

// Database initialization temporarily disabled
// Initialize database
// setupDatabase();

// --- In-memory store for nonces ---
const userNonces = {};

// --- AUTH ROUTES ---

// 1. Get a unique challenge message (nonce) for a user to sign
app.get('/auth/nonce/:address', (req, res) => {
  const { address } = req.params;
  const nonce = randomBytes(32).toString('hex');
  userNonces[address.toLowerCase()] = nonce;
  res.json({ nonce });
});

// 2. Verify the signature and issue a JWT
app.post('/auth/verify', async (req, res) => {
  const { address, signature } = req.body;
  const originalNonce = userNonces[address.toLowerCase()];

  if (!originalNonce) {
    return res.status(400).json({ error: 'No nonce found for this address.' });
  }

  try {
    const message = `Please sign this message to log in: ${originalNonce}`;
    const signerAddress = ethers.verifyMessage(message, signature);

    if (signerAddress.toLowerCase() === address.toLowerCase()) {
      // Signature is valid, create a JWT
      const token = jwt.sign({ address }, JWT_SECRET, { expiresIn: '1h' });
      delete userNonces[address.toLowerCase()]; // Nonce is single-use
      res.json({ token });
    } else {
      res.status(401).json({ error: 'Invalid signature' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error during signature verification.' });
  }
});

// --- MIDDLEWARE to protect routes ---
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (token == null) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// --- USER PROFILE ROUTES (now protected) ---

// This route is now protected. You need a valid JWT to access it.
app.get('/users/me', authenticateToken, async (req, res) => {
    // req.user.address is available from the JWT
    const result = await pool.query('SELECT * FROM users WHERE wallet_address = $1', [req.user.address]);
    if (result.rows.length > 0) {
        res.json(result.rows[0]);
    } else {
        res.status(404).json({ error: 'User not found' });
    }
});

// ... (your existing POST /users route can remain as is for creating a profile) ...

app.listen(port, () => {
    console.log(`🚀 API Gateway listening on http://localhost:${port}`);
});