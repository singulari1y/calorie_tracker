const express = require('express');
const router = express.Router();
const Food = require('../models/Food');
const Nutrition = require('../models/Nutrition');

// Middleware to check authentication
const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: 'Not authenticated' });
};

// Search nutrition database
router.get('/search', isAuthenticated, async (req, res) => {
  try {
    const { query } = req.query;
    const foods = await Nutrition.find({
      name: { $regex: query, $options: 'i' }
    }).limit(10);
    res.json(foods);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add new food entry
router.post('/', isAuthenticated, async (req, res) => {
  try {
    const { name, quantity, mealType, notes, date } = req.body;
    
    // Find the nutrition data
    const nutritionData = await Nutrition.findOne({ name });
    if (!nutritionData) {
      return res.status(404).json({ message: 'Food not found in database' });
    }

    // Calculate nutrients based on quantity
    const multiplier = quantity / nutritionData.quantity;
    const food = new Food({
      name,
      mealType,
      quantity,
      notes,
      calories: Math.round(nutritionData.calories * multiplier),
      protein: Math.round(nutritionData.protein * multiplier),
      carbohydrates: Math.round(nutritionData.carbs * multiplier),
      fat: Math.round(nutritionData.fat * multiplier),
      userId: req.user._id,
      date: date ? new Date(date) : new Date()
    });

    await food.save();
    res.status(201).json(food);
  } catch (err) {
    console.error('Error adding food:', err);
    res.status(400).json({ message: err.message });
  }
});

// Get all food entries for a user
router.get('/', isAuthenticated, async (req, res) => {
  try {
    const foods = await Food.find({ userId: req.user._id })
      .sort({ date: -1 });
    res.json(foods);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get food entries by date
router.get('/date/:date', isAuthenticated, async (req, res) => {
  try {
    const startDate = new Date(req.params.date);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(req.params.date);
    endDate.setHours(23, 59, 59, 999);

    const foods = await Food.find({
      userId: req.user._id,
      date: { $gte: startDate, $lte: endDate }
    }).sort({ date: -1 });
    res.json(foods);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update food entry
router.put('/:id', isAuthenticated, async (req, res) => {
  try {
    const { name, quantity, mealType, notes } = req.body;
    
    // Find the nutrition data if name is being updated
    let nutritionData;
    if (name) {
      nutritionData = await Nutrition.findOne({ name });
      if (!nutritionData) {
        return res.status(404).json({ message: 'Food not found in database' });
      }
    }

    // Find the existing food entry
    const existingFood = await Food.findOne({ _id: req.params.id, userId: req.user._id });
    if (!existingFood) {
      return res.status(404).json({ message: 'Food entry not found' });
    }

    // Calculate new nutrient values if name or quantity changed
    let updateData = { ...req.body };
    if (name || quantity) {
      const newQuantity = quantity || existingFood.quantity;
      const newNutritionData = nutritionData || await Nutrition.findOne({ name: existingFood.name });
      const multiplier = newQuantity / newNutritionData.quantity;
      
      updateData = {
        ...updateData,
        calories: Math.round(newNutritionData.calories * multiplier),
        protein: Math.round(newNutritionData.protein * multiplier),
        carbohydrates: Math.round(newNutritionData.carbs * multiplier),
        fat: Math.round(newNutritionData.fat * multiplier)
      };
    }

    // Remove date from update data to preserve the original date
    delete updateData.date;

    const food = await Food.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      updateData,
      { new: true }
    );
    res.json(food);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete food entry
router.delete('/:id', isAuthenticated, async (req, res) => {
  try {
    const food = await Food.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });
    if (!food) {
      return res.status(404).json({ message: 'Food entry not found' });
    }
    res.json({ message: 'Food entry deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router; 