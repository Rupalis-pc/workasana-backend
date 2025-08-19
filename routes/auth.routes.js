const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/user.model");
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";

// SIGNUP
router.post("/auth/signup", async (req, res) => {
  try {
    const { name, password, email } = req.body;
    if (!name || !password || !email) {
      return res.status(400).json({ message: "All fields are required." });
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "Email is already registered." });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ name, email, password: hashedPassword });
    await newUser.save();
    res.status(201).json({ message: "User registered successfully." });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// LOGIN
router.post("/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required." });
    }
    const user = await User.findOne({ email });
    if (!user || !user.password) {
      return res.status(401).json({ message: "Invalid email or password." });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password." });
    }
    const token = jwt.sign(
      { id: user._id, email: user.email, name: user.name },
      JWT_SECRET,
      { expiresIn: "1h" }
    );
    res.json({ message: "Login Successful", token });
  } catch (error) {
    res.status(500).json({ message: "Server error.", error: error.message });
  }
});

// GET LOGGED-IN USER
router.get("/auth/me", require("../middleware/verifyJWT"), async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching user.", error: error.message });
  }
});

module.exports = router;
