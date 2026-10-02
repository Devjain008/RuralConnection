const logger = require("../utils/logger");

const errorMiddleware = (err, req, res, next) => {
    let statusCode = err.statusCode || 500;
    let message = err.message || "Internal server error";

    // Handle Mongoose duplicate key error (E11000)
    if (err.code === 11000) {
        statusCode = 409;
        const field = Object.keys(err.keyValue || {})[0] || "Field";
        message = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`;
    }

    // Handle Mongoose CastError (invalid ObjectId)
    if (err.name === "CastError") {
        statusCode = 400;
        message = `Invalid ${err.path}: ${err.value}`;
    }

    // Handle Mongoose ValidationError
    if (err.name === "ValidationError") {
        statusCode = 400;
        const errors = Object.values(err.errors).map((e) => e.message);
        message = errors.join(", ");
    }

    // Log operational vs programmer errors
    if (statusCode >= 500) {
        logger.error("Internal Server Error", {
            requestId: req.id,
            error: err.message,
            stack: err.stack
        });
    } else {
        logger.warn("Client Request Error", {
            requestId: req.id,
            statusCode,
            message
        });
    }

    const response = {
        success: false,
        message
    };

    // Never leak stack trace in production
    if (process.env.NODE_ENV !== "production" && statusCode >= 500) {
        response.stack = err.stack;
    }

    res.status(statusCode).json(response);
};

module.exports = errorMiddleware;