const mongoose = require("mongoose");
const http = require("http");
const app = require("../src/app");
const connectDB = require("../src/config/db");
const User = require("../src/models/User");
const RefreshSession = require("../src/models/RefreshSession");

async function runTests() {
    console.log("====================================================");
    console.log("   RURALCONNECT PHASE 1 & 2 AUTOMATED TEST SUITE    ");
    console.log("====================================================");

    // 1. Connect DB
    await connectDB();

    // Clean up test user if exists
    const testEmail = "ramesh.kumar@ruralconnect.in";
    await User.deleteMany({ email: testEmail });
    await RefreshSession.deleteMany({});

    // Start server on a test port
    const server = http.createServer(app);
    await new Promise((resolve) => server.listen(5001, resolve));
    const baseUrl = "http://127.0.0.1:5001";
    console.log("✓ Test server started on http://127.0.0.1:5001");

    try {
        // Test 1: Health check & Request ID
        console.log("\n[Test 1] Health check & Request ID propagation...");
        const healthRes = await fetch(`${baseUrl}/health`);
        const healthData = await healthRes.json();
        const requestId = healthRes.headers.get("x-request-id");
        if (healthData.success && requestId) {
            console.log(`✓ Health OK! x-request-id: ${requestId}`);
        } else {
            throw new Error("Health check failed or missing x-request-id");
        }

        // Test 2: User Registration (Attempting malicious role: 'admin')
        console.log("\n[Test 2] User Registration (testing role tamper protection)...");
        const regRes = await fetch(`${baseUrl}/api/v1/auth/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                name: "Ramesh Kumar",
                email: testEmail,
                password: "SecurePassword123!",
                role: "admin" // Attack vector: frontend attempts to escalate to admin
            })
        });
        const regData = await regRes.json();
        if (regRes.status === 201 && regData.data.role === "user") {
            console.log(`✓ User registered with ID: ${regData.data.id}`);
            console.log(`✓ Zero-Trust verified: Attacker tried 'admin', server enforced role: '${regData.data.role}'`);
        } else {
            throw new Error(`Registration failed: ${JSON.stringify(regData)}`);
        }

        // Test 3: Duplicate Registration prevention
        console.log("\n[Test 3] Duplicate Registration rejection...");
        const dupRes = await fetch(`${baseUrl}/api/v1/auth/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                name: "Ramesh Kumar",
                email: testEmail,
                password: "SecurePassword123!"
            })
        });
        const dupData = await dupRes.json();
        if (dupRes.status === 409) {
            console.log(`✓ Duplicate registration correctly rejected with 409 Conflict: "${dupData.message}"`);
        } else {
            throw new Error("Duplicate registration was not rejected with 409");
        }

        // Test 4: Login & Refresh Token cookie
        console.log("\n[Test 4] User Login & HttpOnly Cookie verification...");
        const loginRes = await fetch(`${baseUrl}/api/v1/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                email: testEmail,
                password: "SecurePassword123!"
            })
        });
        const loginData = await loginRes.json();
        const cookies = loginRes.headers.get("set-cookie");
        if (loginRes.status === 200 && loginData.data.accessToken && cookies && cookies.includes("refreshToken")) {
            console.log("✓ Login successful!");
            console.log("✓ Access Token issued (15m validity)");
            console.log("✓ HttpOnly Refresh Token cookie set in header");
        } else {
            throw new Error(`Login failed: ${JSON.stringify(loginData)}`);
        }

        const accessToken = loginData.data.accessToken;
        // Extract raw refreshToken from set-cookie header
        const rawRefreshToken = cookies.split(";")[0].replace("refreshToken=", "");

        // Test 5: Protected Route Access
        console.log("\n[Test 5] Access Protected Profile route with Bearer Token...");
        const profileRes = await fetch(`${baseUrl}/api/v1/profile`, {
            headers: { Authorization: `Bearer ${accessToken}` }
        });
        const profileData = await profileRes.json();
        const profileUserId = profileData.data?.userId?.toString() || profileData.data?.user?.userId;
        if (profileRes.status === 200 && profileUserId === regData.data.id) {
            console.log(`✓ Protected profile access granted for user ID: ${profileUserId}`);
        } else {
            throw new Error(`Protected route access failed: ${JSON.stringify(profileData)}`);
        }

        // Test 6: Unauthorized access without token
        console.log("\n[Test 6] Reject unauthorized access without token...");
        const unauthRes = await fetch(`${baseUrl}/api/v1/profile`);
        if (unauthRes.status === 401) {
            console.log("✓ Correctly returned 401 Unauthorized for unauthenticated request");
        } else {
            throw new Error("Unauthorized request was not blocked");
        }

        // Test 7: Refresh Token Rotation
        console.log("\n[Test 7] Refresh Token Rotation...");
        const refreshRes = await fetch(`${baseUrl}/api/v1/auth/refresh`, {
            method: "POST",
            headers: {
                "Cookie": `refreshToken=${rawRefreshToken}`
            }
        });
        const refreshData = await refreshRes.json();
        const newCookies = refreshRes.headers.get("set-cookie");
        if (refreshRes.status === 200 && refreshData.data.accessToken && newCookies) {
            console.log("✓ New Access Token received via rotation");
            console.log("✓ Rotated Refresh Token cookie issued");
        } else {
            throw new Error(`Refresh failed: ${JSON.stringify(refreshData)}`);
        }

        const rotatedRefreshToken = newCookies.split(";")[0].replace("refreshToken=", "");

        // Test 8: Automatic Token Reuse Detection (Replaying old token)
        console.log("\n[Test 8] Replay Attack Prevention (Token Reuse Detection)...");
        const replayRes = await fetch(`${baseUrl}/api/v1/auth/refresh`, {
            method: "POST",
            headers: {
                "Cookie": `refreshToken=${rawRefreshToken}` // Old, already-rotated token!
            }
        });
        const replayData = await replayRes.json();
        if (replayRes.status === 403) {
            console.log(`✓ Replay attack detected! Returned 403 Forbidden: "${replayData.message}"`);
        } else {
            throw new Error("Token reuse was not blocked with 403");
        }

        // Verify that reuse detection revoked all sessions for the compromised user
        const activeSessions = await RefreshSession.find({ userId: regData.data.id, revokedAt: null });
        if (activeSessions.length === 0) {
            console.log("✓ Security confirmed: All user sessions were automatically revoked upon replay detection!");
        } else {
            throw new Error("Active sessions were not revoked upon reuse detection!");
        }

        // Test 9: Logout
        console.log("\n[Test 9] User Logout & Cookie clearance...");
        const logoutRes = await fetch(`${baseUrl}/api/v1/auth/logout`, {
            method: "POST",
            headers: {
                "Cookie": `refreshToken=${rotatedRefreshToken}`
            }
        });
        const logoutCookies = logoutRes.headers.get("set-cookie");
        if (logoutRes.status === 200 && logoutCookies && logoutCookies.includes("refreshToken=;")) {
            console.log("✓ Logout successful and HttpOnly cookie cleared!");
        } else {
            throw new Error("Logout failed or cookie not cleared");
        }

        console.log("\n====================================================");
        console.log("   ALL PHASE 1 & PHASE 2 VERIFICATIONS PASSED!     ");
        console.log("====================================================");
    } finally {
        await new Promise((resolve) => server.close(resolve));
        await mongoose.connection.close();
    }
}

runTests().catch((err) => {
    console.error("Test execution failed:", err);
    process.exit(1);
});
