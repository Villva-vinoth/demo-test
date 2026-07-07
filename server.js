const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;
const USERS_FILE_PATH = path.join(__dirname, 'users.json');

// Middleware
app.use(cors());
app.use(express.json());

// Helper function to read users from JSON file
const readUsersFromFile = () => {
  try {
    if (!fs.existsSync(USERS_FILE_PATH)) {
      throw new Error('Users data file not found');
    }
    const data = fs.readFileSync(USERS_FILE_PATH, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading users file:', error);
    throw error;
  }
};

// Login Route
app.post('/login', (req, res) => {
  try {
    const { username, password } = req.body;

    // Validate inputs
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        error: 'Username and password are required'
      });
    }

    // Load users
    let users;
    try {
      users = readUsersFromFile();
    } catch (err) {
      return res.status(500).json({
        success: false,
        error: 'Internal server error: unable to load user database'
      });
    }

    // Authenticate (case-insensitive for username comparison)
    const user = users.find(
      (u) => u.username.toLowerCase() === username.toLowerCase()
    );

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid username. User not found in database.'
      });
    }

    if (user.password !== password) {
      return res.status(401).json({
        success: false,
        error: 'Incorrect password.'
      });
    }

    // Successful login
    return res.json({
      success: true,
      message: 'Login successful',
      user: {
        username: user.username
      }
    });

  } catch (error) {
    console.error('Login route error:', error);
    return res.status(500).json({
      success: false,
      error: 'An unexpected error occurred during login'
    });
  }
});

// A simple status endpoint
app.get('/status', (req, res) => {
  res.json({ status: 'running', timestamp: new Date() });
});


// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
