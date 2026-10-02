const express = require('express');
const rateLimit = require('express-rate-limit');
const {
    chat,
    classifyJob,
    getConversations,
    getMessages
} = require('../controllers/ai.controller');
const { protect } = require('../middleware/auth.middleware');
const authorize = require('../middleware/authorize.middleware');

const router = express.Router();

// Strict AI rate limiter to prevent abuse and API exhaustion
const aiLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 15,
    message: {
        success: false,
        message: 'AI chat rate limit exceeded. Please wait a moment before sending another message.'
    }
});

router.use(protect);
router.use(aiLimiter);

router.post('/chat', chat);
router.post('/classify-job', authorize('retailer', 'admin'), classifyJob);
router.get('/conversations', getConversations);
router.get('/conversations/:conversationId/messages', getMessages);

module.exports = router;
