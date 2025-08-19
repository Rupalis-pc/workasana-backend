const express = require("express");
const Team = require("../models/team.model");
const Member = require("../models/members.model");
const router = express.Router();
const verifyJWT = require("../middleware/verifyJWT");

// ADD TEAM (with member names)
router.post("/teams", verifyJWT, async (req, res) => {
  try {
    const { name, description, members } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Team name is required" });
    }

    const teamExists = await Team.findOne({ name });
    if (teamExists) {
      return res.status(409).json({ message: "Team already exists" });
    }

    let memberIds = [];
    if (members && members.length > 0) {
      const cleaned = members.map((m) => m.trim()).filter((m) => m);

      const existingMembers = await Member.find({ name: { $in: cleaned } });
      const existingNames = existingMembers.map((m) => m.name);

      const newNames = cleaned.filter((n) => !existingNames.includes(n));

      const newMembers = await Member.insertMany(
        newNames.map((n) => ({ name: n }))
      );

      memberIds = [
        ...existingMembers.map((m) => m._id),
        ...newMembers.map((m) => m._id),
      ];
    }

    const newTeam = new Team({
      name,
      description,
      members: memberIds,
    });

    await newTeam.save();

    res.status(201).json({
      message: "Team created successfully",
      team: await newTeam.populate("members", "name _id"),
    });
  } catch (error) {
    res.status(500).json({
      message: "Error creating team",
      error: error.message,
    });
  }
});

// FETCH TEAMS (with members populated)
router.get("/teams", verifyJWT, async (req, res) => {
  try {
    const teams = await Team.find().populate("members", "name _id");
    res.json(teams);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching teams", error: error.message });
  }
});

// GET single team by ID
router.get("/teams/:id", verifyJWT, async (req, res) => {
  try {
    const team = await Team.findById(req.params.id).populate(
      "members",
      "name _id"
    );
    if (!team) return res.status(404).json({ message: "Team not found" });
    res.json(team);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error fetching team", error: err.message });
  }
});

// ADD a member to a team
router.post("/teams/:id/members", verifyJWT, async (req, res) => {
  try {
    const { name } = req.body;
    if (!name)
      return res.status(400).json({ message: "Member name is required" });

    // find or create member
    let member = await Member.findOne({ name });
    if (!member) {
      member = new Member({ name });
      await member.save();
    }

    const team = await Team.findById(req.params.id);
    if (!team) return res.status(404).json({ message: "Team not found" });

    if (!team.members.includes(member._id)) {
      team.members.push(member._id);
      await team.save();
    }

    res.json(await team.populate("members", "name _id"));
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error adding member", error: err.message });
  }
});

module.exports = router;
