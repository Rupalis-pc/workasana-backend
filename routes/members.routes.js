const express = require("express");
const Member = require("../models/members.model");
const router = express.Router();
const verifyJWT = require("../middleware/verifyJWT");

// ADD MEMBER(s)
router.post("/members", verifyJWT, async (req, res) => {
  try {
    let { names } = req.body;

    // normalize input (allow single string or array)
    if (!names) {
      return res.status(400).json({ message: "Member name(s) are required" });
    }
    if (!Array.isArray(names)) {
      names = [names]; // wrap single name into array
    }

    // remove duplicates in input
    names = [...new Set(names.map((n) => n.trim()))];

    if (names.length === 0) {
      return res.status(400).json({ message: "No valid names provided" });
    }

    // check which names already exist
    const existingMembers = await Member.find({ name: { $in: names } });
    const existingNames = existingMembers.map((m) => m.name);

    // filter new names only
    const newNames = names.filter((n) => !existingNames.includes(n));

    if (newNames.length === 0) {
      return res.status(409).json({ message: "All members already exist" });
    }

    // bulk insert
    const newMembers = await Member.insertMany(
      newNames.map((n) => ({ name: n }))
    );

    res.status(201).json({
      message: "Members created successfully",
      created: newMembers,
      skipped: existingNames, // send skipped ones too
    });
  } catch (error) {
    res.status(500).json({
      message: "Error creating members",
      error: error.message,
    });
  }
});

// FETCH MEMBERS
router.get("/members", verifyJWT, async (req, res) => {
  try {
    const member = await Member.find();
    res.json(member);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching members", error: error.message });
  }
});

module.exports = router;
