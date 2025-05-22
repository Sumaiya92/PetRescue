const Message = require('../models/Message');
const router = require('express').Router();
const { GoogleGenerativeAI } = require("@google/generative-ai");
const fetchContextData = require('./contextData');
// Initialize Google Generative AI (Gemini Vision)
const genAI = new GoogleGenerativeAI('AIzaSyC8DAChYdFPif4RgQSYVkneoMHKDvnjgrw');

async function processImage(base64Image, userPrompt = "") {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-vision" });

    // Determine mimeType based on base64 header or default to jpeg
    let mimeType = "image/jpeg";
    if (base64Image.startsWith("/9j/")) {
      mimeType = "image/jpeg";
    } else if (base64Image.startsWith("iVBORw0KGgo")) {
      mimeType = "image/png";
    } else if (base64Image.startsWith("R0lGODlh")) {
      mimeType = "image/gif";
    }

    // Create a better prompt for the model to get more relevant pet health information
    const promptText = userPrompt 
      ? `Please analyze this pet image. ${userPrompt}. Focus on visible health indicators, potential issues, and provide veterinary advice if appropriate.` 
      : "Please analyze this pet image. Identify the pet type, breed if possible, and any visible health indicators. If you notice any potential health issues, please mention them.";

    // Prepare request with both image and text prompt
    const parts = [
      {
        text: promptText
      },
      {
        inlineData: {
          mimeType: mimeType,
          data: base64Image
        }
      }
    ];

    // Set temperature for more consistent results
    const generationConfig = {
      temperature: 0.4,
      maxOutputTokens: 800,
    };

    const result = await model.generateContent({
      contents: [{ role: "user", parts: parts }],
      generationConfig
    });

    const response = result.response?.text();
    
    if (!response) {
      throw new Error("Empty response from model");
    }
    
    return response;
  } catch (error) {
    console.error("Error processing image:", error);
    
    // More specific error messages
    if (error.message?.includes("RESOURCE_EXHAUSTED")) {
      return "Image processing limit reached. Please try again later.";
    } else if (error.message?.includes("INVALID_ARGUMENT")) {
      return "The image couldn't be processed. It may be too large or in an unsupported format.";
    } else if (error.message?.includes("UNAVAILABLE")) {
      return "The image processing service is temporarily unavailable. Please try again later.";
    }
    
    return "I couldn't analyze this image properly. Please try a clearer photo or describe your pet's condition.";
  }
}

// In your router.post endpoint, update the image handling:

router.post('/', async (req, res) => {
  try {
    const { message, userId, imageBase64 } = req.body;

    if (!message && !imageBase64) {
      return res.status(400).json({ error: 'Either message or image is required' });
    }

    const defaultUserId = '67d3cfc3b40a951803c0185c';
    const userIdToUse = userId || defaultUserId;

    // Fetch previous conversation history for better context
    const previousMessages = await Message.find({ userId: userIdToUse }).sort({ createdAt: -1 }).limit(5);

    const chatHistory = previousMessages
      .reverse()
      .map(msg => `${msg.sender}: ${msg.text}`)
      .join("\n");

    const contextData = await fetchContextData();

    const formattedContext = `
                              Lost/Found Pets: ${contextData.lostFoundPets.length}
                              Adoptable Pets: ${contextData.pets.length}
                              Community Posts: ${contextData.posts.length}
                              Veterinarians: ${contextData.vets.map(v => v.name).join(', ')}
                              `;

    let aiResponse = "";

    if (imageBase64) {
      // Validate base64 string
      if (!imageBase64 || typeof imageBase64 !== 'string' || imageBase64.length < 100) {
        console.error('Invalid base64 image data received:', 
          typeof imageBase64, 
          imageBase64 ? `Length: ${imageBase64.length}` : 'null or undefined'
        );
        aiResponse = "I couldn't process the image. The image data appears to be invalid or corrupted.";
      } else {
        console.log(`Processing image with base64 data of length: ${imageBase64.length}`);
        
        try {
          // Process Image using Gemini Vision with message as context if available
          aiResponse = await processImage(imageBase64, message || "");
        } catch (imageError) {
          console.error('Error in image processing:', imageError);
          aiResponse = "I couldn't process the image. There was an error during analysis.";
        }
      }
    }

    if (message && (!imageBase64 || aiResponse.includes("couldn't process"))) {
      // Process Text with Gemini Chat if there's a message or image processing failed
      try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const textPrompt = `
You are Dr. Paws, a helpful veterinary assistant for pet owners.
You are knowledgeable about pets and animals of all kinds.
You are professional yet friendly and conversational.
Keep responses concise (under 3 sentences when possible).
Always prioritize recommending professional veterinary care for urgent health concerns.

Relevant Info:
${formattedContext}

Chat History:
${chatHistory}

${imageBase64 && aiResponse.includes("couldn't process") ? 
  "Note: The user tried to upload an image but I couldn't process it. Please acknowledge this in your response." : ""}

User: ${message}

Dr. Paws:
`;

        const result = await model.generateContent(textPrompt);
        const textResponse = result.response?.text() || "I'm sorry, I couldn't process your request.";

        // Combine Image & Text Responses
        aiResponse = imageBase64 && !aiResponse.includes("couldn't process") ? 
          `Image Analysis: ${aiResponse}\n\nChat Response: ${textResponse}` : 
          textResponse;
      } catch (textError) {
        console.error('Error processing text message:', textError);
        aiResponse = aiResponse || "I'm sorry, I couldn't process your request right now.";
      }
    }

    // Save user message & bot response to database
    await Message.create({ text: message || "[Image Message]", sender: 'user', userId: userIdToUse });
    await Message.create({ text: aiResponse, sender: 'bot', userId: userIdToUse });

    return res.json({ message: aiResponse });

  } catch (error) {
    console.error('Error in chat endpoint:', error);
    return res.status(500).json({ error: 'Failed to process your request: ' + error.message });
  }
});


router.get('/history', async (req, res) => {
  try {
    const { userId } = req.query;
    const defaultUserId = '67d3cfc3b40a951803c0185c';
    const userIdToUse = userId || defaultUserId;

    // Fetch previous conversation history
    const messages = await Message.find({ userId: userIdToUse })
      .sort({ createdAt: 1 })
      .limit(50);

    return res.json(messages);
  } catch (error) {
    console.error('Error fetching chat history:', error);
    return res.status(500).json({ error: 'Failed to fetch chat history' });
  }
});

// Clear chat history
router.delete('/history', async (req, res) => {
  try {
    const { userId } = req.body;
    const defaultUserId = '67d3cfc3b40a951803c0185c';
    const userIdToUse = userId || defaultUserId;

    await Message.deleteMany({ userId: userIdToUse });
    return res.json({ success: true, message: 'Chat history cleared successfully' });
  } catch (error) {
    console.error('Error clearing chat history:', error);
    return res.status(500).json({ error: 'Failed to clear chat history' });
  }
});

module.exports = router;