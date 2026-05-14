const express = require("express");
const router = express.Router();
const { parseMemory } = require("../ai/memoryParser");
const Task = require("../models/Task");
const auth = require("../middleware/auth");

router.post("/memory", auth, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ error: "Text required" });
    }

    const memory = await parseMemory(text);

    const savedTasks = await Promise.all(
      memory.tasks.map((task) =>
        Task.create({
          ...task,
          user: req.user.id,
        })
      )
    );

    console.log("Saved " + savedTasks.length + " tasks for user " + req.user.id);

    res.json({
      success: true,
      tasks: savedTasks,
    });
  } catch (err) {
    console.error("AI error:", err.message);
    res.status(500).json({ error: "AI processing failed" });
  }
});

module.exports = router;
