const { generateText } = require('./gemini.service');
const logger = require('../utils/logger');

const classifyJobWithAI = async ({ title, description, skills = [], qualification = '' }) => {
    const prompt = `
Analyze the following rural/semi-urban job posting and classify it into structured categories.
Job Title: ${title}
Job Description: ${description}
Provided Skills: ${Array.isArray(skills) ? skills.join(', ') : skills}
Required Qualification: ${qualification}

Return ONLY valid JSON matching this schema with no markdown or formatting ticks:
{
  "industry": "Agriculture/Farming" OR "Retail/Shop" OR "Construction/Labour" OR "Transportation/Logistics" OR "Craft/Handloom" OR "Services/Maintenance" OR "Education/Healthcare" OR "Technology/Office",
  "experienceLevel": "ENTRY" OR "MID" OR "SENIOR",
  "workNature": "PHYSICAL" OR "SKILLED_MANUAL" OR "CUSTOMER_FACING" OR "OFFICE_DESK",
  "recommendedSkills": ["skill1", "skill2", "skill3"],
  "confidenceScore": 0.95,
  "summaryHindi": "इस नौकरी का सरल हिंदी में एक वाक्य का सारांश",
  "summaryEnglish": "A one sentence summary of this job"
}
`;

    try {
        const rawOutput = await generateText(prompt, "You are an expert Indian rural job market taxonomist. Return ONLY valid JSON.");
        const cleaned = rawOutput.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(cleaned);
        return parsed;
    } catch (err) {
        logger.warn('AI Job Classification fallback engaged:', err.message);
        // Fallback rule-based classification
        const lower = (title + " " + description).toLowerCase();
        let industry = "Services/Maintenance";
        if (lower.includes('farm') || lower.includes('kisan') || lower.includes('tractor') || lower.includes('crop') || lower.includes('krishi')) {
            industry = "Agriculture/Farming";
        } else if (lower.includes('shop') || lower.includes('dukan') || lower.includes('sales') || lower.includes('counter')) {
            industry = "Retail/Shop";
        } else if (lower.includes('driver') || lower.includes('delivery') || lower.includes('gaadi')) {
            industry = "Transportation/Logistics";
        } else if (lower.includes('mason') || lower.includes('mistri') || lower.includes('plumber') || lower.includes('electrician')) {
            industry = "Craft/Handloom";
        }

        return {
            industry,
            experienceLevel: "ENTRY",
            workNature: "SKILLED_MANUAL",
            recommendedSkills: Array.isArray(skills) && skills.length > 0 ? skills : [title],
            confidenceScore: 0.80,
            summaryHindi: `${title} के पद के लिए अवसर`,
            summaryEnglish: `Job opportunity for ${title}`
        };
    }
};

module.exports = {
    classifyJobWithAI
};
