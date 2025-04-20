const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  googleId: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  age: {
    type: Number
  },
  weight: {
    type: Number
  },
  height: {
    type: Number
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other']
  },
  activityLevel: {
    type: String,
    enum: ['sedentary', 'lightly active', 'moderately active', 'very active', 'extra active']
  },
  dailyCalorieGoal: {
    type: Number,
    default: 2000
  },
  profileComplete: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('User', userSchema); 