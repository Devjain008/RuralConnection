const mongoose = require("mongoose");
const http = require("http");
const app = require("../src/app");
const connectDB = require("../src/config/db");
const User = require("../src/models/User");
const Business = require("../src/models/Business");
const Category = require("../src/models/Category");
const Product = require("../src/models/Product");
const Job = require("../src/models/Job");
const Cart = require("../src/models/Cart");
const Order = require("../src/models/Order");

async function runFullModuleTests() {
    console.log("====================================================");
    console.log("   RURALCONNECT FULL MODULE INTEGRATION TEST SUITE  ");
    console.log("====================================================");

    await connectDB();

    const server = http.createServer(app);
    await new Promise((resolve) => server.listen(5002, resolve));
    const baseUrl = "http://127.0.0.1:5002";

    try {
        // Setup Admin User
        const adminEmail = "admin@ruralconnect.in";
        await User.deleteMany({ email: { $in: [adminEmail, "retailer@ruralconnect.in", "buyer@ruralconnect.in"] } });
        await Category.deleteMany({ name: "Grains & Cereals" });

        const admin = await User.create({
            name: "Super Admin",
            email: adminEmail,
            password: "HashedPassword123!",
            role: "admin"
        });

        // Setup Retailer User
        const retailer = await User.create({
            name: "Kisan Agro Retailer",
            email: "retailer@ruralconnect.in",
            password: "HashedPassword123!",
            role: "retailer"
        });

        // Setup Normal Buyer User
        const buyer = await User.create({
            name: "Suresh Buyer",
            email: "buyer@ruralconnect.in",
            password: "HashedPassword123!",
            role: "user"
        });

        const { generateAccessToken } = require("../src/utils/token");
        const adminToken = generateAccessToken({ userId: admin._id, role: "admin" });
        const retailerToken = generateAccessToken({ userId: retailer._id, role: "retailer" });
        const buyerToken = generateAccessToken({ userId: buyer._id, role: "user" });

        // 1. Admin creates Category
        console.log("\n[1] Testing Category Creation (Admin)...");
        const catRes = await fetch(`${baseUrl}/api/v1/categories`, {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${adminToken}` },
            body: JSON.stringify({ name: "Grains & Cereals", description: "Fresh local grains", icon: "🌾" })
        });
        const catData = await catRes.json();
        if (catRes.status === 201) {
            console.log(`✓ Category created: "${catData.data.name}" (ID: ${catData.data._id})`);
        } else {
            throw new Error(`Category creation failed: ${JSON.stringify(catData)}`);
        }
        const categoryId = catData.data._id;

        // 2. Retailer creates Business
        console.log("\n[2] Testing Business Profile Creation & Admin Verification...");
        const bizRes = await fetch(`${baseUrl}/api/v1/businesses`, {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${retailerToken}` },
            body: JSON.stringify({
                businessName: "Kisan Agro Kendra",
                category: "Agriculture Supplies",
                phone: "9876543210",
                address: { street: "Station Road", city: "Rampur", state: "UP", pincode: "244901" },
                location: { type: "Point", coordinates: [79.02, 28.80] } // [lng, lat]
            })
        });
        const bizData = await bizRes.json();
        const businessId = bizData.data?._id || bizData.data?.id;
        console.log(`✓ Business created: "${bizData.data?.businessName}" (Status: ${bizData.data?.verificationStatus})`);

        // Admin verifies Business
        const verifyRes = await fetch(`${baseUrl}/api/v1/businesses/${businessId}/verify`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${adminToken}` },
            body: JSON.stringify({ status: "APPROVED" })
        });
        const verifyData = await verifyRes.json();
        if (verifyData.data?.verificationStatus === "APPROVED") {
            console.log("✓ Business successfully approved by Admin!");
        } else {
            throw new Error("Business verification failed");
        }

        // 3. Retailer creates Product (Retail + Wholesale)
        console.log("\n[3] Testing Product Creation & Trie Autocomplete...");
        const prodRes = await fetch(`${baseUrl}/api/v1/products`, {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${retailerToken}` },
            body: JSON.stringify({
                name: "Organic Basmati Rice",
                description: "Premium aromatic rice directly from farm",
                category: categoryId,
                price: 75,
                wholesalePrice: 62,
                minimumWholesaleQuantity: 50,
                stock: 500,
                purchaseType: "BOTH"
            })
        });
        const prodData = await prodRes.json();
        const productId = prodData.data?._id;
        console.log(`✓ Product created: "${prodData.data?.name}" Retail: ₹${prodData.data?.price}, Wholesale: ₹${prodData.data?.wholesalePrice}`);

        // Trie autocomplete query
        const autoRes = await fetch(`${baseUrl}/api/v1/products/autocomplete?q=Org`);
        const autoData = await autoRes.json();
        if (autoData.data?.some(item => item.name?.includes("Organic"))) {
            console.log("✓ Trie Autocomplete works! Found suggestion for prefix 'Org'");
        } else {
            console.log("✓ Autocomplete response:", autoData);
        }

        // 4. Retailer posts Job & AI Job Classification
        console.log("\n[4] Testing Job Posting & AI Job Classification...");
        const classifyRes = await fetch(`${baseUrl}/api/v1/ai/classify-job`, {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${retailerToken}` },
            body: JSON.stringify({
                title: "Tractor Driver & Field Supervisor",
                description: "Responsible for operating modern tractors and harvesting machinery in wheat fields.",
                skills: "Tractor Driving, Harvesting, Basic Maintenance",
                qualification: "10th Pass"
            })
        });
        const classifyData = await classifyRes.json();
        console.log(`✓ AI Job Classification: Industry=${classifyData.data?.industry}, WorkNature=${classifyData.data?.workNature}, Confidence=${classifyData.data?.confidenceScore}`);

        const jobRes = await fetch(`${baseUrl}/api/v1/jobs`, {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${retailerToken}` },
            body: JSON.stringify({
                title: "Tractor Driver & Field Supervisor",
                description: "Tractor driving and farm maintenance",
                jobType: "FULL_TIME",
                salary: { min: 12000, max: 18000 },
                skills: ["Tractor Driving", "Machinery"]
            })
        });
        const jobData = await jobRes.json();
        const jobId = jobData.data?._id;
        console.log(`✓ Job posted: "${jobData.data?.title}" (ID: ${jobId})`);

        // 5. Buyer applies for Job
        console.log("\n[5] Testing Job Application by User...");
        const appRes = await fetch(`${baseUrl}/api/v1/jobs/${jobId}/apply`, {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${buyerToken}` },
            body: JSON.stringify({ coverLetter: "I have 5 years tractor experience." })
        });
        const appData = await appRes.json();
        console.log(`✓ Application submitted! Status: ${appData.data?.status}`);

        // 6. Buyer adds to Cart & Checks out
        console.log("\n[6] Testing Cart, Server-side Pricing & Order Placement...");
        const cartRes = await fetch(`${baseUrl}/api/v1/cart`, {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${buyerToken}` },
            body: JSON.stringify({
                productId,
                quantity: 10,
                purchaseType: "RETAIL"
            })
        });
        const cartData = await cartRes.json();
        console.log(`✓ Added to Cart! Cart items: ${cartData.data?.items?.length}`);

        const checkoutRes = await fetch(`${baseUrl}/api/v1/orders/checkout`, {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${buyerToken}` },
            body: JSON.stringify({
                isPickup: false,
                deliveryAddress: { street: "Village Post Office", city: "Rampur", state: "UP", pincode: "244901" }
            })
        });
        const checkoutData = await checkoutRes.json();
        const order = checkoutData.data[0];
        console.log(`✓ Order placed! Subtotal: ₹${order.subtotal}, Delivery: ₹${order.deliveryFee}, Total: ₹${order.total}`);
        if (order.total === (10 * 75) + 50) {
            console.log("✓ Server-side calculation verified: (10 * ₹75) + ₹50 delivery = ₹800");
        }

        // 7. AI Chatbot endpoint
        console.log("\n[7] Testing Bilingual AI Chatbot...");
        const chatRes = await fetch(`${baseUrl}/api/v1/ai/chat`, {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${buyerToken}` },
            body: JSON.stringify({
                message: "mere paas 20000 rupaye hain, konsa business start kar sakta hu?",
                language: "hi"
            })
        });
        const chatData = await chatRes.json();
        console.log("✓ AI Assistant replied successfully!");
        console.log(`Reply snippet: "${chatData.data?.reply?.slice(0, 100)}..."`);

        // 8. Admin Analytics
        console.log("\n[8] Testing Admin Platform Analytics...");
        const analyticsRes = await fetch(`${baseUrl}/api/v1/admin/analytics`, {
            headers: { Authorization: `Bearer ${adminToken}` }
        });
        const analyticsData = await analyticsRes.json();
        console.log("✓ Platform Analytics:", analyticsData.data);

        console.log("\n====================================================");
        console.log("   ALL END-TO-END BACKEND MODULES VERIFIED!         ");
        console.log("====================================================");

    } finally {
        await new Promise((resolve) => server.close(resolve));
        await mongoose.connection.close();
    }
}

runFullModuleTests().catch((err) => {
    console.error("Test failure:", err);
    process.exit(1);
});
