const express = require('express');
const cors = require('cors');

const app = express();
const port = 3001; // A different port than our frontend

app.use(cors());
app.use(express.json());

// A test route to confirm the server is running
app.get('/', (req, res) => {
  res.send('API Gateway is running!');
});

app.listen(port, () => {
  console.log(`🚀 API Gateway listening on http://localhost:${port}`);
});