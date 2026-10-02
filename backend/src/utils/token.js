const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { jwtAccessSecret, jwtRefreshSecret } = require("../config/env");

/**
 * Generate a short-lived access token (15 minutes)
 * Contains minimal user claims: userId and role
 */
const generateAccessToken = ({ userId, role }) => {
    return jwt.sign(
        {
            userId,
            role
        },
        jwtAccessSecret,
        {
            expiresIn: "15m"
        }
    );
};

/**
 * Generate a longer-lived refresh token (7 days)
 * Contains userId and a unique token id (jti) for cryptographic uniqueness
 */
const generateRefreshToken = ({ userId }) => {
    const jti = crypto.randomUUID();
    return jwt.sign(
        {
            userId,
            jti
        },
        jwtRefreshSecret,
        {
            expiresIn: "7d"
        }
    );
};

/**
 * Verify Access Token
 */
const verifyAccessToken = (token) => {
    return jwt.verify(token, jwtAccessSecret);
};

/**
 * Verify Refresh Token
 */
const verifyRefreshToken = (token) => {
    return jwt.verify(token, jwtRefreshSecret);
};

/**
 * Create a SHA-256 hash of a token string for safe database storage
 */
const hashToken = (token) => {
    return crypto.createHash("sha256").update(token).digest("hex");
};

module.exports = {
    generateAccessToken,
    generateRefreshToken,
    verifyAccessToken,
    verifyRefreshToken,
    hashToken
};