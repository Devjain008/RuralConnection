/**
 * Standardized API Response Utilities
 * RuralConnect API Contract
 * Supports both object-signature and positional-signature
 */

const sendSuccess = (res, optionsOrCode = {}, extraData = null) => {
    let statusCode = 200;
    let message = "Operation successful";
    let data = null;
    let pagination = null;

    if (typeof optionsOrCode === "number") {
        statusCode = optionsOrCode;
        data = extraData;
    } else {
        statusCode = optionsOrCode.statusCode || 200;
        message = optionsOrCode.message || "Operation successful";
        data = optionsOrCode.data !== undefined ? optionsOrCode.data : null;
        pagination = optionsOrCode.pagination || null;
    }

    const responsePayload = {
        success: true,
        message
    };

    if (data !== null) {
        responsePayload.data = data;
    }

    if (pagination !== null) {
        responsePayload.pagination = pagination;
    }

    return res.status(statusCode).json(responsePayload);
};

const sendError = (res, optionsOrCode = {}, extraMessage = null) => {
    let statusCode = 500;
    let message = "Something went wrong";
    let errors = null;

    if (typeof optionsOrCode === "number") {
        statusCode = optionsOrCode;
        message = extraMessage || "Something went wrong";
    } else {
        statusCode = optionsOrCode.statusCode || 500;
        message = optionsOrCode.message || "Something went wrong";
        errors = optionsOrCode.errors || null;
    }

    const responsePayload = {
        success: false,
        message
    };

    if (errors !== null) {
        responsePayload.errors = errors;
    }

    return res.status(statusCode).json(responsePayload);
};

module.exports = {
    sendSuccess,
    sendError
};
