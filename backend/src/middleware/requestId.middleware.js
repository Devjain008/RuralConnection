const crypto = require("crypto");

/**
 * Request ID Middleware
 * Assigns or propagates a unique correlation ID to every incoming request.
 */
const requestIdMiddleware = (req, res, next) => {
    const requestId = req.headers["x-request-id"] || crypto.randomUUID();
    req.id = requestId;
    res.setHeader("x-request-id", requestId);
    next();
};

module.exports = requestIdMiddleware;
