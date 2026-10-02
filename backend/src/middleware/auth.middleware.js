const { verifyAccessToken } = require("../utils/token");
const AppError = require("../utils/AppError");

/**
 * Protect route middleware
 * Ensures incoming request has a valid Bearer JWT access token
 */
const protect = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return next(new AppError("Authentication required. Please provide a valid Bearer token.", 401));
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = verifyAccessToken(token);
        req.user = {
            ...decoded,
            id: decoded.userId,
            _id: decoded.userId
        };
        next();
    } catch (error) {
        if (error.name === "TokenExpiredError") {
            return next(new AppError("Access token expired. Please refresh your session.", 401));
        }
        return next(new AppError("Invalid access token. Authentication failed.", 401));
    }
};

module.exports = protect;
module.exports.protect = protect;