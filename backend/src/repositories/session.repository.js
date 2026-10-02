const RefreshSession = require("../models/RefreshSession");

class SessionRepository {
    async createSession({ userId, tokenHash, expiresAt, ipAddress, userAgent }) {
        return await RefreshSession.create({
            userId,
            tokenHash,
            expiresAt,
            ipAddress,
            userAgent
        });
    }

    async findByTokenHash(tokenHash) {
        return await RefreshSession.findOne({ tokenHash }).exec();
    }

    async revokeSession(sessionId, replacedByTokenHash = null) {
        return await RefreshSession.findByIdAndUpdate(
            sessionId,
            {
                revokedAt: new Date(),
                replacedByTokenHash
            },
            { returnDocument: "after" }
        ).exec();
    }

    async revokeAllUserSessions(userId) {
        return await RefreshSession.updateMany(
            { userId, revokedAt: null },
            { revokedAt: new Date() }
        ).exec();
    }
}

module.exports = new SessionRepository();
