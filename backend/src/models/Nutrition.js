const mongoose = require('mongoose');

const nutritionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  quantity: {
    type: Number,
    required: true
  },
  calories: {
    type: Number,
    required: true
  },
  carbs: {
    type: Number,
    required: true
  },
  fat: {
    type: Number,
    required: true
  },
  protein: {
    type: Number,
    required: true
  },
  sodium: {
    type: Number,
    required: true
  },
  sugar: {
    type: Number,
    required: true
  }
});

module.exports = mongoose.model('Nutrition', nutritionSchema); 