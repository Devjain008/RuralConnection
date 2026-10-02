const app = require("./app");
const { port } = require("./config/env");
const connectDB = require("./config/db");
const authService = require("./services/auth.service");

const startServer = async () => {
    try {
        await connectDB();

        // Seed default Administrator (admin / admin123)
        await authService.seedDefaultAdmin();

        app.listen(port, () => {
            console.log(`RuralConnect server running on port ${port}`);
        });
    } catch (error) {
        console.error("Server startup failed:", error);
        process.exit(1);
    }
};

startServer();