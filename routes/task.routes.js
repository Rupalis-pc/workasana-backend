const express = require("express");
const Task = require("../models/task.model");
const router = express.Router();
const verifyJWT = require("../middleware/verifyJWT");

// CREATE TASK
router.post("/tasks", verifyJWT, async (req, res) => {
  try {
    const { name, project, team, owners, tags, timeToComplete, status } =
      req.body;
    const newTask = new Task({
      name,
      project,
      team,
      owners,
      tags,
      timeToComplete,
      status,
      createdBy: req.user.id,
      createdAt: new Date(),
    });
    await newTask.save();
    res
      .status(201)
      .json({ message: "Task created successfully.", task: newTask });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error creating task.", error: error.message });
  }
});

// GET TASKS WITH FILTERS
router.get("/tasks", verifyJWT, async (req, res) => {
  try {
    const { team, owner, tags, project, status } = req.query;
    let query = {};
    if (team) query.team = team;
    if (project) query.project = project;
    if (status) query.status = status;
    if (owner) query.owners = { $in: [owner] };
    if (tags) query.tags = { $in: tags.split(",") };
    const tasks = await Task.find(query);
    res.json({ count: tasks.length, tasks });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching tasks.", error: error.message });
  }
});

// UPDATE TASK
router.put("/tasks/:id", verifyJWT, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const updatedTask = await Task.findByIdAndUpdate(id, updates, {
      new: true,
    });
    if (!updatedTask) {
      return res.status(404).json({ message: "Task not found" });
    }
    res.json({ message: "Task updated successfully", task: updatedTask });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating task.", error: error.message });
  }
});

// DELETE TASK
router.delete("/tasks/:id", verifyJWT, async (req, res) => {
  try {
    const { id } = req.params;
    const deletedTask = await Task.findByIdAndDelete(id);
    if (!deletedTask) {
      return res.status(404).json({ message: "Task not found" });
    }
    res.json({ message: "Task deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting task.", error: error.message });
  }
});

module.exports = router;
