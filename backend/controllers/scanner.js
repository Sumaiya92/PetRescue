const express = require('express');
const router = express.Router();
const multer = require("multer");
const path = require('path');
const fs = require('fs'); // <-- MISSING import
const axios = require('axios');

// Set up multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

// Multer upload middleware
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Max: 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Function to analyze image with Gemini API
const analyzeWithGemini = async (imagePath) => {
  const imageBuffer = fs.readFileSync(imagePath);
  const base64Image = imageBuffer.toString('base64');

  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=AIzaSyBWJZ66j7jh5A3X08GTUm2Dv-IKhTomQGk`,
      {
        contents: [
          {
            parts: [
              {
                text: "Analyze this pet image. Provide the following information in JSON format: species, breed, age_estimate, health_indicators (as array), behavior_notes, and recommendations (as array). Only respond with valid JSON."
              },
              {
                inline_data: {
                  mime_type: "image/jpeg",
                  data: base64Image
                }
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 800
        }
      }
    );

    const content = response.data.candidates[0].content.parts[0].text;
    const jsonMatch = content.match(/({[\s\S]*})/);
    const jsonString = jsonMatch ? jsonMatch[0] : content;
    const result = JSON.parse(jsonString);

    return {
      species: result.species || "Unknown",
      breed: result.breed || "Unknown",
      age_estimate: result.age_estimate || "Unknown",
      health_indicators: Array.isArray(result.health_indicators) ? result.health_indicators : [],
      behavior_notes: result.behavior_notes || "",
      recommendations: Array.isArray(result.recommendations) ? result.recommendations : []
    };
  } catch (error) {
    console.error("Error calling Gemini API:", error.response?.data || error.message);
    throw new Error("Failed to analyze image with Gemini");
  }
};

// POST /api/analyze - Analyze uploaded pet image
router.post('/api/analyze', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image uploaded' });
    }

    const imagePath = req.file.path;
    const analysisResult = await analyzeWithGemini(imagePath);

    // Delete uploaded image after analysis
    fs.unlinkSync(imagePath);

    res.json(analysisResult);
  } catch (error) {
    console.error('Error analyzing image:', error);
    res.status(500).json({ error: error.message || 'Failed to analyze pet image' });
  }
});

// GET /api/health - Health check route
router.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Pet Scanner API is running (Gemini only)' });
});

module.exports = router;
