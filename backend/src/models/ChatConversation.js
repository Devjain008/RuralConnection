const mongoose = require('mongoose');

const chatConversationSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    conversationId: { type: String, required: true, unique: true },
    language: { type: String, enum: ['en', 'hi'], default: 'en' },
    title: { type: String, default: 'New Conversation' }
}, { timestamps: true });

module.exports = mongoose.model('ChatConversation', chatConversationSchema);
