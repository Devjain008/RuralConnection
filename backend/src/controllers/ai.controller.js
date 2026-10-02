const aiService = require('../ai/ai.service');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/apiResponse');
const AppError = require('../utils/AppError');

exports.chat = asyncHandler(async (req, res) => {
    const { message, conversationId, language } = req.body;
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
        throw new AppError('Message is required', 400);
    }

    const response = await aiService.chat({
        userId: req.user.id,
        conversationId,
        message: message.trim(),
        language: language || 'en'
    });

    return sendSuccess(res, { statusCode: 200, data: response });
});

exports.classifyJob = asyncHandler(async (req, res) => {
    const { title, description, skills, qualification } = req.body;
    if (!title || !description) {
        throw new AppError('Job title and description are required for AI classification', 400);
    }

    const classification = await aiService.classifyJob({
        title,
        description,
        skills,
        qualification
    });

    return sendSuccess(res, { statusCode: 200, data: classification });
});

exports.getConversations = asyncHandler(async (req, res) => {
    const conversations = await aiService.getConversations(req.user.id);
    return sendSuccess(res, { statusCode: 200, data: conversations });
});

exports.getMessages = asyncHandler(async (req, res) => {
    const messages = await aiService.getMessages(req.params.conversationId);
    return sendSuccess(res, { statusCode: 200, data: messages });
});
