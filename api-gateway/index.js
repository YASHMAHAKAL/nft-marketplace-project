const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const { ethers } = require('ethers');
const jwt = require('jsonwebtoken');
const { randomBytes } = require('crypto');

const app = express();
const port = 3001;
const JWT_SECRET = 'your-super-secret-key-that-should-be-in-an-env-file'; // For production, use an environment variable

// --- Database Connection & Setup ---
const pool = new Pool({ /* ... your db config ... */ });
const createUsersTable = async () => { /* ... same as before ... */ };

app.use(cors());
app.use(express.json());

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
    createUsersTable();
});