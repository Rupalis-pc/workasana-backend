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

// Total count of all tasks by status
router.get("/report/total-work-done", async (req, res) => {
  try {
    const results = await Task.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Closed tasks grouped by team (with team name)
router.get("/report/closed-tasks-team", async (req, res) => {
  try {
    const results = await Task.aggregate([
      { $match: { status: "Completed" } },
      { $group: { _id: "$team", totalClosed: { $sum: 1 } } },
      {
        $lookup: {
          from: "teams",
          localField: "_id",
          foreignField: "_id",
          as: "teamInfo",
        },
      },
      { $unwind: { path: "$teamInfo", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 0,
          teamId: "$_id",
          teamName: "$teamInfo.name",
          totalClosed: 1,
        },
      },
    ]);
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Closed tasks grouped by owner
router.get("/report/closed-tasks-owner", async (req, res) => {
  try {
    const results = await Task.aggregate([
      { $match: { status: "Completed" } },
      { $unwind: "$owners" },
      { $group: { _id: "$owners", totalClosed: { $sum: 1 } } },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "ownerInfo",
        },
      },
      { $unwind: { path: "$ownerInfo", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 0,
          ownerId: "$_id",
          ownerName: "$ownerInfo.name",
          totalClosed: 1,
        },
      },
    ]);
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
