const express = require("express");
const Task = require("../models/task.model");
const router = express.Router();

// Tasks completed in the last week
router.get("/report/last-week", async (req, res) => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const tasks = await Task.find({
      status: "Completed",
      updatedAt: { $gte: sevenDaysAgo },
    });
    res.json({ count: tasks.length, tasks });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Total work days pending
router.get("/report/pending", async (req, res) => {
  try {
    const tasks = await Task.find({ status: { $ne: "Completed" } });
    const totalPendingDays = tasks.reduce(
      (acc, task) => acc + (task.timeToComplete || 0),
      0
    );
    res.json({ totalPendingDays });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Closed tasks grouped by team, owner, or project
router.get("/report/closed-tasks", async (req, res) => {
  try {
    const { groupBy } = req.query;
    if (!["team", "owner", "project"].includes(groupBy)) {
      return res.status(400).json({ error: "Invalid groupBy value" });
    }
    const groupField = "$" + groupBy;
    const results = await Task.aggregate([
      { $match: { status: "Completed" } },
      { $group: { _id: groupField, totalClosed: { $sum: 1 } } },
    ]);
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
