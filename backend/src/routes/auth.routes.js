const express = require("express");
const {
    register,
    registerRetailer,
    login,
    refresh,
    logout,
    getMe
} = require("../controllers/auth.controller");
const protect = require("../middleware/auth.middleware");

const router = express.Router();

router.post("/register", register);
router.post("/register-retailer", registerRetailer);
router.post("/login", login);
router.post("/refresh", refresh);
router.post("/logout", logout);
router.get("/me", protect, getMe);

module.exports = router;