const mongoose = require("mongoose");

const refreshSessionSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },
        tokenHash: {
            type: String,
            required: true,
            unique: true,
            index: true
        },
        expiresAt: {
            type: Date,
            required: true,
            index: { expires: 0 } // MongoDB TTL index: automatically purges expired sessions
        },
        revokedAt: {
            type: Date,
            default: null
        },
        replacedByTokenHash: {
            type: String,
            default: null
        },
        ipAddress: {
            type: String,
            default: null
        },
        userAgent: {
            type: String,
            default: null
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("RefreshSession", refreshSessionSchema);
