const express = require('express');
const router = express.Router();
const passport = require('passport');

// Google OAuth routes
router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    res.redirect('http://localhost:3000/dashboard');
  }
);

// Logout route
router.get('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      console.error('Error during logout:', err);
      return res.status(500).json({ message: 'Error during logout' });
    }
    res.json({ success: true });
  });
});

// Check authentication status
router.get('/status', (req, res) => {
  res.json({ isAuthenticated: req.isAuthenticated(), user: req.user });
});

module.exports = router; 