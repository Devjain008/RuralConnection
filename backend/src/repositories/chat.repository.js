const ChatConversation = require('../models/ChatConversation');
const ChatMessage = require('../models/ChatMessage');

class ChatRepository {
    async createConversation(data) {
        return await ChatConversation.create(data);
    }

    async findConversationById(conversationId) {
        return await ChatConversation.findOne({ conversationId }).exec();
    }

    async findConversationsByUser(userId) {
        return await ChatConversation.find({ userId }).sort({ updatedAt: -1 }).exec();
    }

    async updateConversationTitle(conversationId, title) {
        return await ChatConversation.findOneAndUpdate(
            { conversationId },
            { title, updatedAt: new Date() },
            { returnDocument: 'after' }
        ).exec();
    }

    async addMessage(data) {
        return await ChatMessage.create(data);
    }

    async getMessages(conversationId, limit = 50) {
        return await ChatMessage.find({ conversationId })
            .sort({ timestamp: 1 })
            .limit(limit)
            .exec();
    }
}

module.exports = new ChatRepository();
