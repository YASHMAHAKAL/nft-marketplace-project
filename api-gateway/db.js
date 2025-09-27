const { Pool } = require('pg');

// Create database pool - try different authentication methods
const pool = new Pool({
  user: process.env.DB_USER || 'yash',
  host: process.env.DB_HOST || 'localhost',
  database: 'nft_marketplace',
  // Remove password field entirely for peer authentication
  port: 5432,
});

// Export the pool for use in other files
module.exports = pool;