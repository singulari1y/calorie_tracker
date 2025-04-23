const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Middleware to check authentication
const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: 'Not authenticated' });
};

// Middleware to check if profile is complete
const isProfileComplete = (req, res, next) => {
  if (!req.user.profileComplete) {
    return res.status(403).json({ 
      message: 'Please complete your profile before using this feature',
      redirectTo: '/profile'
    });
  }
  next();
};

// Get user profile
router.get('/profile', isAuthenticated, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-googleId');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update user profile
router.put('/profile', isAuthenticated, async (req, res) => {
  try {
    const { age, weight, height, gender, activityLevel, dailyCalorieGoal } = req.body;
    
    // Check if all required fields are provided
    if (!age || !weight || !height || !gender || !activityLevel || !dailyCalorieGoal) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    const profileComplete = true;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { ...req.body, profileComplete },
      { new: true, runValidators: true }
    ).select('-googleId');
    res.json(user);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Calculate daily calorie goal based on user profile
router.get('/calorie-goal', isAuthenticated, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Harris-Benedict Equation for BMR
    let bmr;
    if (user.gender === 'male') {
      bmr = 88.362 + (13.397 * user.weight) + (4.799 * user.height) - (5.677 * user.age);
    } else {
      bmr = 447.593 + (9.247 * user.weight) + (3.098 * user.height) - (4.330 * user.age);
    }

    // Activity level multipliers
    const activityMultipliers = {
      'sedentary': 1.2,
      'lightly active': 1.375,
      'moderately active': 1.55,
      'very active': 1.725,
      'extra active': 1.9
    };

    const dailyCalorieGoal = Math.round(bmr * activityMultipliers[user.activityLevel]);
    res.json({ dailyCalorieGoal });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router; 