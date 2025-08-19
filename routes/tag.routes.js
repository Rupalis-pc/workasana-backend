const express = require("express");
const Tag = require("../models/tag.model");
const router = express.Router();

// CREATE A NEW TAG
router.post("/tags", async (req, res) => {
  try {
    const { name } = req.body;
    const existingTag = await Tag.findOne({
      name: new RegExp(`^${name}$`, "i"),
    });
    if (existingTag) {
      return res.status(400).json({ message: "Tag already exists" });
    }
    const newTag = new Tag({ name });
    await newTag.save();
    res.status(201).json({ message: "Tag created successfully", tag: newTag });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error creating tag", error: error.message });
  }
});

// GET ALL TAGS
router.get("/tags", async (req, res) => {
  try {
    const tags = await Tag.find();
    res.json(tags);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching tags", error: error.message });
  }
});

module.exports = router;
