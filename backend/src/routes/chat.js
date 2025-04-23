const express = require('express');
const router = express.Router();
const Food = require('../models/Food');
const User = require('../models/User');

// Store conversation history in memory (you might want to use a database for production)
let conversationHistory = [];
const MAX_HISTORY_LENGTH = 10;

async function getRelevantFoodItems(query, userId) {
  try {
    // Parse query for keywords
    const keywords = query
      .toLowerCase()
      .split(" ")
      .filter((word) => word.length > 2);

    // Check for meal type mentions
    const mealTypes = [];
    if (query.toLowerCase().includes("breakfast")) mealTypes.push("breakfast");
    if (query.toLowerCase().includes("lunch")) mealTypes.push("lunch");
    if (query.toLowerCase().includes("dinner")) mealTypes.push("dinner");
    if (query.toLowerCase().includes("snack")) mealTypes.push("snack");

    // Check for calorie mentions
    let calorieQuery = {};
    if (query.toLowerCase().includes("low calorie") || query.toLowerCase().includes("low-calorie")) {
      calorieQuery = { calories: { $lt: 300 } };
    } else if (query.toLowerCase().includes("high calorie") || query.toLowerCase().includes("high-calorie")) {
      calorieQuery = { calories: { $gt: 400 } };
    }

    // Build query based on input
    let dbQuery = { userId };

    // If meal types specified
    if (mealTypes.length > 0) {
      dbQuery.mealType = { $in: mealTypes };
    }

    // If calorie filter specified
    if (Object.keys(calorieQuery).length > 0) {
      dbQuery = { ...dbQuery, ...calorieQuery };
    }

    // If keywords for name or description
    if (keywords.length > 0) {
      const keywordQueries = keywords.map((keyword) => ({
        $or: [{ name: { $regex: keyword, $options: "i" } }, { notes: { $regex: keyword, $options: "i" } }],
      }));

      if (Object.keys(dbQuery).length > 0) {
        dbQuery = { $and: [dbQuery, { $or: keywordQueries }] };
      } else {
        dbQuery = { $or: keywordQueries };
      }
    }

    // If no specific query was built, just return some items
    if (Object.keys(dbQuery).length === 0) {
      return await Food.find(dbQuery).limit(5);
    }

    const foods = await Food.find(dbQuery).limit(5);

    // If no items found with specific query, return some defaults
    if (foods.length === 0) {
      if (mealTypes.length > 0) {
        return await Food.find({ userId, mealType: { $in: mealTypes } }).limit(3);
      } else {
        return await Food.find({ userId }).limit(3);
      }
    }

    return foods;
  } catch (err) {
    console.error("Error fetching food items:", err);
    return [];
  }
}

function formatFoodDataForLLM(foods) {
  if (!foods || foods.length === 0) return "";

  return foods
    .map((food) => {
      return `- ${food.name} (${food.mealType}): ${food.calories} calories\n  Notes: ${food.notes}\n  Nutrition: ${food.protein}g protein, ${food.carbohydrates}g carbs, ${food.fat}g fat`;
    })
    .join("\n\n");
}

async function getResponseFromLocalLLM(history, foodContext = "", userData = null, todayFoods = []) {
  try {
    // Check if Ollama is running
    try {
      const checkResponse = await fetch("http://localhost:11434/api/version");
      if (!checkResponse.ok) {
        return "Error: Ollama API is not responding. Please make sure Ollama is running.";
      }
    } catch (fetchError) {
      return "Error: Cannot connect to Ollama. Please make sure Ollama is running on port 11434.";
    }

    const messages = [];

    // Add system message with food context and user data
    if (foodContext || userData || todayFoods.length > 0) {
      let systemMessage = "SYSTEM: YOU MUST FOLLOW THESE RULES EXACTLY! You are a nutrition and meal planning assistant.\n";
      systemMessage += "1. ONLY give the direct answer without ANY explanation or reasoning\n";
      systemMessage += "2. Do NOT show your work or calculations\n";
      systemMessage += "3. Respond in a SINGLE sentence\n";
      systemMessage += "4. Focus ONLY on nutrition facts from the database\n";
      systemMessage += "5. If asked about calories, just give the total number\n";
      
      if (userData) {
        systemMessage += `6. User profile: Age ${userData.age}, Weight ${userData.weight}kg, Gender ${userData.gender}\n`;
        systemMessage += `7. Height: ${userData.height || '5 feet 2 inches'}\n`;
      } else {
        systemMessage += "6. Assume default user profile: Age 20, Weight 50kg, Female\n";
        systemMessage += "7. Height: 5 feet 2 inches\n";
      }
      
      systemMessage += "8. Consider the food data provided as today's intake\n";
      systemMessage += "9. Assume portion size of 1 for all items\n";
      systemMessage += "10. Base recommendations on the user's profile and food data\n\n";
      
      if (todayFoods.length > 0) {
        systemMessage += "Today's food entries:\n";
        todayFoods.forEach(food => {
          systemMessage += `- ${food.name} (${food.mealType}): ${food.calories} calories, ${food.protein}g protein, ${food.carbohydrates}g carbs, ${food.fat}g fat\n`;
        });
        systemMessage += "\n";
      }
      
      if (foodContext) {
        systemMessage += `Available food information:\n${foodContext}`;
      }

      messages.push({ role: "system", content: systemMessage });
    }

    // Add conversation history
    history.forEach((msg) => {
      messages.push({ role: msg.role, content: msg.content });
    });

    const response = await fetch("http://localhost:11434/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "tinyllama",
        messages: messages,
        stream: false,
        options: {
          num_ctx: 2048,
          top_k: 30,
          top_p: 0.9,
          temperature: 0.7,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return `Error connecting to Ollama: ${response.status}`;
    }

    const data = await response.json();
    return data.message?.content || "No response from model";
  } catch (error) {
    console.error("Failed to communicate with Ollama:", error);
    return "Sorry, I encountered an error: " + error.message;
  }
}

// Chat endpoint
router.post('/', async (req, res) => {
  try {
    const { message } = req.body;
    const userId = req.user._id;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    // Get user data
    const userData = await User.findById(userId).select('age weight gender height');

    // Get today's food entries
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayFoods = await Food.find({
      userId,
      date: {
        $gte: today,
        $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
      }
    }).sort({ date: -1 });

    // Limit conversation history
    if (conversationHistory.length >= MAX_HISTORY_LENGTH) {
      conversationHistory = conversationHistory.slice(-MAX_HISTORY_LENGTH + 1);
    }

    // Add user message to history
    conversationHistory.push({ role: "user", content: message });

    // Get relevant food items based on user query
    const relevantFoods = await getRelevantFoodItems(message, userId);
    const foodContext = formatFoodDataForLLM(relevantFoods);

    // Get response from local LLM
    const response = await getResponseFromLocalLLM(conversationHistory, foodContext, userData, todayFoods);

    // Add assistant response to history
    conversationHistory.push({ role: "assistant", content: response });

    res.json({ response });
  } catch (error) {
    console.error("Error processing chat:", error);
    res.status(500).json({ error: "Failed to process chat request", details: error.message });
  }
});

// Clear conversation endpoint
router.post('/clear', (req, res) => {
  conversationHistory = [];
  res.json({ success: true, message: "Conversation history cleared" });
});

module.exports = router; 