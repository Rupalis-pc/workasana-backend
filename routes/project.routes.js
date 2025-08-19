const express = require("express");
const Project = require("../models/project.model");
const router = express.Router();

// ---------------- CREATE NEW PROJECT ----------------
router.post("/projects", async (req, res) => {
  try {
    const { name, description } = req.body;
    const newProject = new Project({ name, description });
    await newProject.save();
    res.status(201).json({
      message: "Project created successfully",
      project: newProject,
      success: true,
    });
  } catch (error) {
    if (error.code === 11000) {
      // Mongo duplicate key error
      return res.status(400).json({
        message: "Project name must be unique",
        error: error.message,
      });
    }
    console.error("Project creation failed:", error);
    res
      .status(500)
      .json({ message: "Error creating project", error: error.message });
  }
});

// ---------------- GET ALL PROJECT ----------------
router.get("/projects", async (req, res) => {
  try {
    const projects = await Project.find();
    res.json(projects);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching projects", error: error.message });
  }
});

module.exports = router;
