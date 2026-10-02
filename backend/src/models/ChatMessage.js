const mongoose = require('mongoose');

const chatMessageSchema = new mongoose.Schema({
    conversationId: { type: String, required: true, index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    role: { type: String, enum: ['user', 'assistant'], required: true },
    content: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
}, { timestamps: true });

chatMessageSchema.index({ conversationId: 1, timestamp: 1 });

module.exports = mongoose.model('ChatMessage', chatMessageSchema);
