const crypto = require('crypto');
const chatRepository = require('../repositories/chat.repository');
const { generateText } = require('./gemini.service');
const { RURAL_CONNECT_SYSTEM_PROMPT } = require('./prompts');
const tools = require('./tools');
const { classifyJobWithAI } = require('./job.classifier');

class AIService {
    async chat({ userId, conversationId, message, language = 'en' }) {
        let activeConvId = conversationId;
        if (!activeConvId) {
            activeConvId = crypto.randomUUID();
            await chatRepository.createConversation({
                userId,
                conversationId: activeConvId,
                language,
                title: message.slice(0, 30) + '...'
            });
        }

        // Save user message
        await chatRepository.addMessage({
            conversationId: activeConvId,
            userId,
            role: 'user',
            content: message
        });

        // Intent detection & tool grounding
        const lower = message.toLowerCase();
        let groundingContext = '';
        let groundingData = null;

        if (lower.includes('product') || lower.includes('buy') || lower.includes('price') || lower.includes('wholesale') || lower.includes('saman') || lower.includes('chawal') || lower.includes('gehu') || lower.includes('rate')) {
            const products = await tools.searchProducts(message, 5);
            if (products.length > 0) {
                groundingData = { type: 'products', items: products };
                groundingContext = `\nREAL STORE PRODUCTS CURRENTLY IN DATABASE:\n` + JSON.stringify(products, null, 2);
            }
        } else if (lower.includes('job') || lower.includes('naukri') || lower.includes('kaam') || lower.includes('work') || lower.includes('hiring') || lower.includes('vacancy')) {
            const jobs = await tools.searchJobs(message, 5);
            if (jobs.length > 0) {
                groundingData = { type: 'jobs', items: jobs };
                groundingContext = `\nREAL OPEN JOBS CURRENTLY IN DATABASE:\n` + JSON.stringify(jobs, null, 2);
            }
        } else if (lower.includes('order') || lower.includes('status') || lower.includes('mera order')) {
            const orders = await tools.getRecentOrders(userId, 3);
            if (orders.length > 0) {
                groundingData = { type: 'orders', items: orders };
                groundingContext = `\nUSER'S RECENT ORDERS IN DATABASE:\n` + JSON.stringify(orders, null, 2);
            }
        }

        // Get past messages for multi-turn context
        const pastMessages = await chatRepository.getMessages(activeConvId, 8);
        const formattedHistory = pastMessages.map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`).join('\n');

        const fullPrompt = `
${groundingContext ? `Context:\n${groundingContext}\n` : ''}
Conversation History:
${formattedHistory}

User's current query:
${message}

Please provide a helpful, warm response in ${language === 'hi' ? 'Hindi / Hinglish' : 'English'}:
`;

        const reply = await generateText(fullPrompt, RURAL_CONNECT_SYSTEM_PROMPT);

        // Save assistant reply
        await chatRepository.addMessage({
            conversationId: activeConvId,
            userId,
            role: 'assistant',
            content: reply
        });

        return {
            conversationId: activeConvId,
            reply,
            groundingData
        };
    }

    async classifyJob(jobData) {
        return await classifyJobWithAI(jobData);
    }

    async getConversations(userId) {
        return await chatRepository.findConversationsByUser(userId);
    }

    async getMessages(conversationId) {
        return await chatRepository.getMessages(conversationId, 50);
    }
}

module.exports = new AIService();
