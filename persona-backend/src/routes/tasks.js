const express = require("express");
const router = express.Router();
const Task = require("../models/Task");
const auth = require("../middleware/auth");

// ---- TODAY ----
router.get("/today", auth, async (req, res) => {
  const start = new Date();
  start.setHours(0, 0, 0, 0);

  const end = new Date();
  end.setHours(23, 59, 59, 999);

  const tasks = await Task.find({
    user: req.user.id,
    dueAt: { $gte: start, $lte: end },
    completed: false,
  }).sort({ priority: -1, dueAt: 1 });

  res.json(tasks);
});

// ---- UPCOMING ----
router.get("/upcoming", auth, async (req, res) => {
  const now = new Date();

  const tasks = await Task.find({
    user: req.user.id,
    dueAt: { $gt: now },
    completed: false,
  })
    .sort({ dueAt: 1 })
    .limit(20);

  res.json(tasks);
});

// ---- COMPLETE TASK ----
router.patch("/:id/complete", auth, async (req, res) => {
  const task = await Task.findOneAndUpdate(
    { _id: req.params.id, user: req.user.id },
    { completed: true },
    { new: true }
  );

  if (!task) return res.status(404).json({ error: "Task not found" });

  res.json(task);
});

module.exports = router;
