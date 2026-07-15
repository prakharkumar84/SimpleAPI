const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.text());
app.use(express.json());

// Endpoint 1: Plain text body
app.post('/api/validate', (req, res) => {
  const id = req.body;

  if (typeof id !== 'string' || id.trim() === '') {
    return res.status(400).json({
      error: 'Invalid input: id must be a non-empty string'
    });
  }

  return res.status(200).json({
    message: 'Valid input',
    id: id
  });
});

// Endpoint 2: JSON body { "id": "string" }
app.post('/api/validate-json', (req, res) => {
  const { id } = req.body;

  if (typeof id !== 'string') {
    return res.status(400).json({
      error: 'Invalid input: id must be a string'
    });
  }

  if (id.trim() === '') {
    return res.status(400).json({
      error: 'Invalid input: id must be a non-empty string'
    });
  }

  return res.status(200).json({
    message: 'Valid input',
    id: id
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
