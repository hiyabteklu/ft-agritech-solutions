require('dotenv').config();

const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: 'https://hiyab.tech'
  })
);
app.use(express.json());

app.post('/api/auth/register', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password are required.' });
  }

  try {
    const passwordHash = await bcrypt.hash(password, 10);

    db.run(
      'INSERT INTO users (email, password_hash) VALUES (?, ?)',
      [email, passwordHash],
      function onInsert(err) {
        if (err) {
          const isDuplicate = err.message.includes('UNIQUE constraint failed');
          return res.status(isDuplicate ? 409 : 500).json({
            success: false,
            message: isDuplicate ? 'User already exists.' : 'Failed to register user.'
          });
        }

        return res.status(201).json({
          success: true,
          message: 'User registered successfully.',
          userId: this.lastID
        });
      }
    );
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Unexpected server error.' });
  }
});

app.post('/api/reports/submit', (req, res) => {
  const { title, description } = req.body;

  if (!title || !description) {
    return res.status(400).json({ success: false, message: 'Title and description are required.' });
  }

  db.run(
    'INSERT INTO problem_reports (title, description) VALUES (?, ?)',
    [title, description],
    function onInsert(err) {
      if (err) {
        return res.status(500).json({ success: false, message: 'Failed to submit report.' });
      }

      return res.status(201).json({
        success: true,
        message: 'Problem report submitted successfully.',
        reportId: this.lastID
      });
    }
  );
});

app.get('/health', (_req, res) => {
  res.json({ success: true, message: 'Backend server is running.' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
