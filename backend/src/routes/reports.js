const express = require('express');
const router = express.Router();
const Food = require('../models/Food');

// Middleware to check authentication
const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: 'Not authenticated' });
};

// Get daily summary
router.get('/daily/:date', isAuthenticated, async (req, res) => {
  try {
    const startDate = new Date(req.params.date);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(req.params.date);
    endDate.setHours(23, 59, 59, 999);

    const foods = await Food.find({
      userId: req.user._id,
      date: { $gte: startDate, $lte: endDate }
    });

    const summary = {
      totalCalories: foods.reduce((sum, food) => sum + food.calories, 0),
      totalProtein: foods.reduce((sum, food) => sum + food.protein, 0),
      totalCarbohydrates: foods.reduce((sum, food) => sum + food.carbohydrates, 0),
      totalFat: foods.reduce((sum, food) => sum + food.fat, 0),
      meals: {
        breakfast: foods.filter(food => food.mealType === 'breakfast'),
        lunch: foods.filter(food => food.mealType === 'lunch'),
        dinner: foods.filter(food => food.mealType === 'dinner'),
        snack: foods.filter(food => food.mealType === 'snack')
      }
    };

    res.json(summary);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get weekly summary
router.get('/weekly/:startDate', isAuthenticated, async (req, res) => {
  try {
    const startDate = new Date(req.params.startDate);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 6);
    endDate.setHours(23, 59, 59, 999);

    const foods = await Food.find({
      userId: req.user._id,
      date: { $gte: startDate, $lte: endDate }
    });

    const dailySummaries = {};
    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(currentDate.getDate() + i);
      const dateStr = currentDate.toISOString().split('T')[0];

      const dayFoods = foods.filter(food => 
        food.date.toISOString().split('T')[0] === dateStr
      );

      dailySummaries[dateStr] = {
        totalCalories: dayFoods.reduce((sum, food) => sum + food.calories, 0),
        totalProtein: dayFoods.reduce((sum, food) => sum + food.protein, 0),
        totalCarbohydrates: dayFoods.reduce((sum, food) => sum + food.carbohydrates, 0),
        totalFat: dayFoods.reduce((sum, food) => sum + food.fat, 0)
      };
    }

    res.json(dailySummaries);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get monthly summary
router.get('/monthly/:year/:month', isAuthenticated, async (req, res) => {
  try {
    const startDate = new Date(req.params.year, req.params.month - 1, 1);
    const endDate = new Date(req.params.year, req.params.month, 0);
    endDate.setHours(23, 59, 59, 999);

    const foods = await Food.find({
      userId: req.user._id,
      date: { $gte: startDate, $lte: endDate }
    });

    const summary = {
      totalCalories: foods.reduce((sum, food) => sum + food.calories, 0),
      totalProtein: foods.reduce((sum, food) => sum + food.protein, 0),
      totalCarbohydrates: foods.reduce((sum, food) => sum + food.carbohydrates, 0),
      totalFat: foods.reduce((sum, food) => sum + food.fat, 0),
      averageDailyCalories: foods.reduce((sum, food) => sum + food.calories, 0) / 
        (endDate.getDate() - startDate.getDate() + 1)
    };

    res.json(summary);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router; 