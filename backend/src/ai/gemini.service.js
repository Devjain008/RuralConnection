const { GoogleGenerativeAI } = require('@google/generative-ai');
const { geminiApiKey } = require('../config/env');
const logger = require('../utils/logger');

let genAI = null;
if (geminiApiKey && geminiApiKey !== 'your_gemini_api_key_here') {
    try {
        genAI = new GoogleGenerativeAI(geminiApiKey);
    } catch (e) {
        logger.error('Failed to initialize GoogleGenerativeAI:', e.message);
    }
}

const generateText = async (prompt, systemInstruction = '') => {
    if (!genAI) {
        return "AI Assistant is running in offline mode. Please configure GEMINI_API_KEY in the environment.";
    }

    try {
        const model = genAI.getGenerativeModel({
            model: 'gemini-2.5-flash',
            systemInstruction: systemInstruction || undefined
        });

        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    } catch (error) {
        logger.error('Gemini API Error:', error.message);
        return "I am currently having trouble connecting to the AI brain. Please try again shortly.";
    }
};

module.exports = {
    generateText
};
