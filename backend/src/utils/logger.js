/**
 * Structured Application Logger
 * Safe logging without leaking sensitive credentials
 */

const formatLog = (level, message, meta = {}) => {
    const logEntry = {
        timestamp: new Date().toISOString(),
        level,
        message,
        ...meta
    };

    // Sanitize any sensitive keys
    const sensitiveKeys = ["password", "token", "refreshToken", "accessToken", "apiKey", "secret"];
    const sanitize = (obj) => {
        if (!obj || typeof obj !== "object") return obj;
        const copy = Array.isArray(obj) ? [...obj] : { ...obj };
        for (const key of Object.keys(copy)) {
            if (sensitiveKeys.includes(key.toLowerCase())) {
                copy[key] = "[REDACTED]";
            } else if (typeof copy[key] === "object") {
                copy[key] = sanitize(copy[key]);
            }
        }
        return copy;
    };

    return JSON.stringify(sanitize(logEntry));
};

const logger = {
    info: (message, meta = {}) => console.log(formatLog("INFO", message, meta)),
    warn: (message, meta = {}) => console.warn(formatLog("WARN", message, meta)),
    error: (message, meta = {}) => console.error(formatLog("ERROR", message, meta)),
    debug: (message, meta = {}) => {
        if (process.env.NODE_ENV !== "production") {
            console.debug(formatLog("DEBUG", message, meta));
        }
    }
};

module.exports = logger;
