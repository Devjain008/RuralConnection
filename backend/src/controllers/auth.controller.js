const authService = require("../services/auth.service");
const { validateRegister } = require("../validators/auth.validator");
const asyncHandler = require("../utils/asyncHandler");
const { sendSuccess } = require("../utils/apiResponse");
const AppError = require("../utils/AppError");

const COOKIE_OPTIONS = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days in milliseconds
};

const register = asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;

    const validationError = validateRegister({ name, email, password });
    if (validationError) {
        throw new AppError(validationError, 400);
    }

    const user = await authService.registerUser({ name, email, password });

    return sendSuccess(res, {
        statusCode: 201,
        message: "User registered successfully",
        data: user
    });
});

const registerRetailer = asyncHandler(async (req, res) => {
    const {
        name,
        email,
        password,
        businessName,
        category,
        phone,
        street,
        city,
        state,
        pincode,
        lng,
        lat,
        deliveryRadiusKm
    } = req.body;

    const validationError = validateRegister({ name, email, password });
    if (validationError) {
        throw new AppError(validationError, 400);
    }

    if (!businessName) {
        throw new AppError("Business name is required for shopkeeper registration", 400);
    }

    const result = await authService.registerRetailer({
        name,
        email,
        password,
        businessName,
        category,
        phone,
        address: { street, city, state, pincode },
        coordinates: [Number(lng) || 79.02, Number(lat) || 28.80],
        deliveryRadiusKm: Number(deliveryRadiusKm) || 10
    });

    return sendSuccess(res, {
        statusCode: 201,
        message: "Shopkeeper registered successfully",
        data: result
    });
});

const login = asyncHandler(async (req, res) => {
    const { email, username, password } = req.body;

    if ((!email && !username) || !password) {
        throw new AppError("Email or username, and password are required", 400);
    }

    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.headers["user-agent"] || "unknown";

    const { user, accessToken, refreshToken } = await authService.loginUser({
        email: email || username,
        username: username || email,
        password,
        ipAddress,
        userAgent
    });

    // Send Refresh Token in secure HttpOnly cookie
    res.cookie("refreshToken", refreshToken, COOKIE_OPTIONS);

    return sendSuccess(res, {
        statusCode: 200,
        message: "Login successful",
        data: {
            user,
            accessToken
        }
    });
});

const refresh = asyncHandler(async (req, res) => {
    const rawRefreshToken = req.cookies.refreshToken || req.body.refreshToken;
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.headers["user-agent"] || "unknown";

    const { accessToken, newRefreshToken } = await authService.refreshUserSession({
        rawRefreshToken,
        ipAddress,
        userAgent
    });

    // Rotate the cookie with new refresh token
    res.cookie("refreshToken", newRefreshToken, COOKIE_OPTIONS);

    return sendSuccess(res, {
        statusCode: 200,
        message: "Token refreshed successfully",
        data: {
            accessToken
        }
    });
});

const logout = asyncHandler(async (req, res) => {
    const rawRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

    await authService.logoutUser({ rawRefreshToken });

    res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax"
    });

    return sendSuccess(res, {
        statusCode: 200,
        message: "Logged out successfully"
    });
});

const getMe = asyncHandler(async (req, res) => {
    const user = await authService.getCurrentUser(req.user.userId || req.user.id);

    return sendSuccess(res, {
        statusCode: 200,
        message: "Current user retrieved successfully",
        data: user
    });
});

module.exports = {
    register,
    registerRetailer,
    login,
    refresh,
    logout,
    getMe
};