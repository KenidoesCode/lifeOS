const express = require("express");
const router = express.Router();
const { parseMemory } = require("../ai/memoryParser");
const Task = require("../models/Task");

const DEV_USER_ID = "507f1f77bcf86cd799439011";

router.post("/memory", async (req, res) => {
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
          user: DEV_USER_ID,
        })
      )
    );

    console.log(`Saved ${savedTasks.length} tasks to MongoDB`);

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
