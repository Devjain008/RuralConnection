const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");

const requestIdMiddleware = require("./middleware/requestId.middleware");
const notFoundMiddleware = require("./middleware/notFound.middleware");
const errorMiddleware = require("./middleware/error.middleware");

const authRoutes = require("./routes/auth.routes");
const profileRoutes = require("./routes/profile.routes");
const businessRoutes = require("./routes/business.routes");
const categoryRoutes = require("./routes/category.routes");
const productRoutes = require("./routes/product.routes");
const jobRoutes = require("./routes/job.routes");
const applicationRoutes = require("./routes/application.routes");
const cartRoutes = require("./routes/cart.routes");
const orderRoutes = require("./routes/order.routes");
const aiRoutes = require("./routes/ai.routes");
const adminRoutes = require("./routes/admin.routes");

const app = express();

app.disable("x-powered-by");

// Security Headers
app.use(helmet());

// Cross-Origin Resource Sharing
const allowedOrigins = process.env.FRONTEND_URL
    ? [process.env.FRONTEND_URL, "http://localhost:5173", "http://localhost:3000"]
    : ["http://localhost:5173", "http://localhost:3000"];

app.use(
    cors({
        origin: (origin, callback) => {
            if (!origin || allowedOrigins.includes(origin) || origin.startsWith("http://localhost")) {
                return callback(null, true);
            }
            return callback(new Error("CORS policy violation"));
        },
        credentials: true
    })
);

// Request Correlation ID Middleware
app.use(requestIdMiddleware);

// Cookie Parser for HttpOnly tokens
app.use(cookieParser());

// Request Body Parsing
app.use(express.json({ limit: "15kb" }));
app.use(express.urlencoded({ extended: true, limit: "15kb" }));

// General Rate Limiting
const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 500,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: "Too many requests from this IP, please try again after 15 minutes"
    }
});
app.use("/api", generalLimiter);

// Morgan HTTP logger with Request ID
morgan.token("id", (req) => req.id);
app.use(morgan("[:id] :method :url :status :response-time ms - :res[content-length]"));

// Health Check
app.get("/health", (req, res) => {
    res.status(200).json({
        success: true,
        message: "RuralConnect API is running",
        timestamp: new Date().toISOString()
    });
});

// API v1 Routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/profile", profileRoutes);
app.use("/api/v1/businesses", businessRoutes);
app.use("/api/v1/categories", categoryRoutes);
app.use("/api/v1/products", productRoutes);
app.use("/api/v1/jobs", jobRoutes);
app.use("/api/v1/applications", applicationRoutes);
app.use("/api/v1/cart", cartRoutes);
app.use("/api/v1/orders", orderRoutes);
app.use("/api/v1/ai", aiRoutes);
app.use("/api/v1/admin", adminRoutes);

// 404 Handler
app.use(notFoundMiddleware);

// Global Error Handler
app.use(errorMiddleware);

module.exports = app;