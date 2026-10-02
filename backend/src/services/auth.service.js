const bcrypt = require("bcryptjs");
const userRepository = require("../repositories/user.repository");
const sessionRepository = require("../repositories/session.repository");
const businessRepository = require("../repositories/business.repository");
const AppError = require("../utils/AppError");
const {
    generateAccessToken,
    generateRefreshToken,
    verifyRefreshToken,
    hashToken
} = require("../utils/token");
const logger = require("../utils/logger");

const REFRESH_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

class AuthService {
    /**
     * Seed default Administrator account
     * Credentials: username: admin / password: admin123
     */
    async seedDefaultAdmin() {
        try {
            const User = require("../models/User");
            const saltRounds = 12;
            const hashedPassword = await bcrypt.hash("admin123", saltRounds);

            let admin = await User.findOne({
                $or: [
                    { username: "admin" },
                    { email: "admin@ruralconnect.in" }
                ]
            }).select("+password");

            if (!admin) {
                admin = await userRepository.createUser({
                    name: "System Administrator",
                    email: "admin@ruralconnect.in",
                    username: "admin",
                    password: hashedPassword,
                    role: "admin",
                    isActive: true
                });
                logger.info("Default Admin seeded successfully (username: admin, pass: admin123)");
            } else {
                // Ensure username, email, password, and role are synchronized
                await User.findByIdAndUpdate(admin._id, {
                    username: "admin",
                    email: "admin@ruralconnect.in",
                    password: hashedPassword,
                    role: "admin",
                    isActive: true
                });
                logger.info("Default Admin credentials verified and synchronized (username: admin, pass: admin123)");
            }
        } catch (err) {
            logger.error("Error seeding default admin:", err.message);
        }
    }

    /**
     * Register a standard User (Customer / Job Seeker)
     * Always assigns the default 'user' role regardless of input payload.
     */
    async registerUser({ name, email, password }) {
        const normalizedEmail = email.toLowerCase().trim();

        const existingUser = await userRepository.findByEmail(normalizedEmail);
        if (existingUser) {
            throw new AppError("An account with this email address already exists", 409);
        }

        const saltRounds = 12;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const newUser = await userRepository.createUser({
            name: name.trim(),
            email: normalizedEmail,
            password: hashedPassword,
            role: "user" // Enforce zero-trust default role
        });

        logger.info("New user registered successfully", { userId: newUser._id, email: newUser.email });

        return {
            id: newUser._id,
            name: newUser.name,
            email: newUser.email,
            role: newUser.role,
            createdAt: newUser.createdAt
        };
    }

    /**
     * Register a Shopkeeper / Retailer Business Owner
     * Explicit retailer registration flow with business location and delivery radius
     */
    async registerRetailer({
        name,
        email,
        password,
        businessName,
        category,
        phone,
        address,
        coordinates = [79.02, 28.80],
        deliveryRadiusKm = 10
    }) {
        const normalizedEmail = email.toLowerCase().trim();

        const existingUser = await userRepository.findByEmail(normalizedEmail);
        if (existingUser) {
            throw new AppError("An account with this email address already exists", 409);
        }

        if (!businessName || !businessName.trim()) {
            throw new AppError("Business name is required for shopkeeper registration", 400);
        }

        const saltRounds = 12;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Create Retailer user
        const newUser = await userRepository.createUser({
            name: name.trim(),
            email: normalizedEmail,
            password: hashedPassword,
            role: "retailer"
        });

        // Create associated Business Profile
        const newBusiness = await businessRepository.createBusiness({
            owner: newUser._id,
            businessName: businessName.trim(),
            category: category || "Retail & General Store",
            phone: phone || "",
            address: address || {},
            location: {
                type: "Point",
                coordinates: Array.isArray(coordinates) ? coordinates : [79.02, 28.80]
            },
            deliveryRadiusKm: Number(deliveryRadiusKm) || 10,
            verificationStatus: "PENDING"
        });

        logger.info("New retailer registered with business profile", {
            userId: newUser._id,
            businessId: newBusiness._id,
            deliveryRadiusKm
        });

        return {
            id: newUser._id,
            name: newUser.name,
            email: newUser.email,
            role: newUser.role,
            business: {
                id: newBusiness._id,
                businessName: newBusiness.businessName,
                deliveryRadiusKm: newBusiness.deliveryRadiusKm
            }
        };
    }

    /**
     * Authenticate user, issue tokens, and persist refresh session
     * Supports login with email OR username (e.g. username: "admin")
     */
    async loginUser({ email, username, password, ipAddress, userAgent }) {
        const identifier = (email || username || "").toLowerCase().trim();

        if (!identifier) {
            throw new AppError("Email or username is required", 400);
        }

        const user = await userRepository.findByEmailOrUsername(identifier, true);
        if (!user || !user.isActive) {
            throw new AppError("Invalid credentials or account inactive", 401);
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            throw new AppError("Invalid credentials", 401);
        }

        const accessToken = generateAccessToken({
            userId: user._id,
            role: user.role
        });

        const refreshToken = generateRefreshToken({
            userId: user._id
        });

        const tokenHash = hashToken(refreshToken);
        const expiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL_MS);

        await sessionRepository.createSession({
            userId: user._id,
            tokenHash,
            expiresAt,
            ipAddress,
            userAgent
        });

        logger.info("User logged in successfully", { userId: user._id, role: user.role });

        return {
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                username: user.username,
                role: user.role
            },
            accessToken,
            refreshToken
        };
    }

    /**
     * Rotate Refresh Token and generate new Access Token
     * Implements Automatic Token Reuse Detection
     */
    async refreshUserSession({ rawRefreshToken, ipAddress, userAgent }) {
        if (!rawRefreshToken) {
            throw new AppError("Refresh token is required", 401);
        }

        let decoded;
        try {
            decoded = verifyRefreshToken(rawRefreshToken);
        } catch (error) {
            throw new AppError("Invalid or expired refresh token", 401);
        }

        const tokenHash = hashToken(rawRefreshToken);
        const session = await sessionRepository.findByTokenHash(tokenHash);

        if (!session) {
            throw new AppError("Session not found or expired", 401);
        }

        // Automatic Token Reuse Detection
        if (session.revokedAt !== null) {
            logger.warn("Token reuse detected! Revoking all sessions for compromised user", {
                userId: session.userId,
                reusedTokenHash: tokenHash
            });
            await sessionRepository.revokeAllUserSessions(session.userId);
            throw new AppError("Security warning: Compromised session detected. All sessions revoked. Please log in again.", 403);
        }

        const user = await userRepository.findById(session.userId);
        if (!user || !user.isActive) {
            throw new AppError("User account no longer active", 401);
        }

        // Generate rotated tokens
        const newAccessToken = generateAccessToken({
            userId: user._id,
            role: user.role
        });

        const newRefreshToken = generateRefreshToken({
            userId: user._id
        });

        const newTokenHash = hashToken(newRefreshToken);
        const expiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL_MS);

        // Invalidate current session and link to replacement
        await sessionRepository.revokeSession(session._id, newTokenHash);

        // Create new session in MongoDB
        await sessionRepository.createSession({
            userId: user._id,
            tokenHash: newTokenHash,
            expiresAt,
            ipAddress,
            userAgent
        });

        logger.info("Refresh token rotated successfully", { userId: user._id });

        return {
            accessToken: newAccessToken,
            newRefreshToken
        };
    }

    /**
     * Terminate user session and revoke token in database
     */
    async logoutUser({ rawRefreshToken }) {
        if (rawRefreshToken) {
            const tokenHash = hashToken(rawRefreshToken);
            const session = await sessionRepository.findByTokenHash(tokenHash);
            if (session && !session.revokedAt) {
                await sessionRepository.revokeSession(session._id);
            }
        }
        return true;
    }

    /**
     * Get user profile details by ID
     */
    async getCurrentUser(userId) {
        const user = await userRepository.findById(userId);
        if (!user || !user.isActive) {
            throw new AppError("User not found", 404);
        }
        return {
            id: user._id,
            name: user.name,
            email: user.email,
            username: user.username,
            role: user.role,
            createdAt: user.createdAt
        };
    }
}

module.exports = new AuthService();