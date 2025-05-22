const express = require('express');
const router = express.Router();


router.post('/pet-doctor', async (req, res) => {
  try {
    const { 
      petType, // 'dog', 'cat', etc.
      breed,
      age,
      weight,
      symptoms,
      symptomDuration,
      behavior,
      eatingHabits,
      previousConditions
    } = req.body;
    
    // Validate required fields
    if (!petType || !symptoms) {
      return res.status(400).json({ 
        success: false, 
        message: 'Pet type and symptoms are required' 
      });
    }

    // Generate AI prompt with the information provided
    const aiPrompt = generatePetDoctorPrompt({
      petType,
      breed,
      age,
      weight,
      symptoms,
      symptomDuration,
      behavior,
      eatingHabits,
      previousConditions
    });

    // Call AI service to generate response
    const aiResponse = await generateAdvice(aiPrompt);
    
    return res.status(200).json({
      success: true,
      advice: aiResponse.advice,
      homeRemedies: aiResponse.homeRemedies,
      vetRecommendation: aiResponse.vetRecommendation,
      urgencyLevel: aiResponse.urgencyLevel // 'low', 'medium', 'high', 'emergency'
    });
    
  } catch (error) {
    console.error('Pet doctor advice generation error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to generate pet health advice'
    });
  }
});

/**
 * Generates a prompt for the AI model based on pet information and symptoms
 * @param {Object} petInfo - Information about the pet and symptoms
 * @returns {String} - Formatted prompt for AI model
 */
function generatePetDoctorPrompt(petInfo) {
  return `
You are Dr. Paws, a helpful veterinary assistant for pet owners.
You are knowledgeable about pets and animals of all kinds.
You are professional yet friendly and conversational.
Your goal is to provide helpful advice while ensuring pet safety.

Based on the following information, provide advice for the pet owner:

Pet Type: ${petInfo.petType || 'Not specified'}
Breed: ${petInfo.breed || 'Not specified'}
Age: ${petInfo.age || 'Not specified'}
Weight: ${petInfo.weight || 'Not specified'}
Symptoms: ${petInfo.symptoms || 'None provided'}
Symptom Duration: ${petInfo.symptomDuration || 'Not specified'}
Behavior Changes: ${petInfo.behavior || 'Not specified'}
Eating Habits: ${petInfo.eatingHabits || 'Not specified'}
Previous Medical Conditions: ${petInfo.previousConditions || 'None specified'}

Please provide:
1. A brief assessment of the situation
2. Safe home remedies or supportive care if applicable
3. Clear recommendation on whether veterinary care is needed (and urgency level)
4. Any warning signs the owner should watch for

Format your response as a JSON object with these keys:
- advice (brief assessment)
- homeRemedies (array of safe home care options)
- vetRecommendation (whether vet care is needed and why)
- urgencyLevel (low, medium, high, or emergency)
`;
}

/**
 * Calls the AI service to generate pet health advice
 * @param {String} prompt - The prompt for the AI model
 * @returns {Object} - The AI response with advice, home remedies, vet recommendation and urgency level
 */
async function generateAdvice(prompt) {
  try {
    // Here you would integrate with your AI service of choice
    // Example with a fictional AI service:
    
    // OPTION 2: Google Gemini integration

    const { GoogleGenerativeAI } = require('@google/generative-ai');
    const genAI = new GoogleGenerativeAI('AIzaSyC8DAChYdFPif4RgQSYVkneoMHKDvnjgrw');
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    const cleanedText = responseText.replace(/```(?:json)?\s*([\s\S]*?)\s*```/, '$1');

    return JSON.parse(cleanedText);

    
    // For demonstration purposes, return a mock response
    return {
      advice: "Based on the symptoms described, your pet appears to be experiencing mild digestive discomfort.",
      homeRemedies: [
        "Temporarily switch to a bland diet (boiled chicken and rice) for 24-48 hours",
        "Ensure fresh water is always available",
        "Monitor for any changes in behavior or worsening symptoms"
      ],
      vetRecommendation: "If symptoms persist beyond 48 hours or if your pet shows signs of severe discomfort, lethargy, or refuses to eat/drink, please consult your veterinarian.",
      urgencyLevel: "medium"
    };
    
  } catch (error) {
    console.error('AI service error:', error);
    throw new Error('Failed to generate advice from AI service');
  }
}

module.exports = router;