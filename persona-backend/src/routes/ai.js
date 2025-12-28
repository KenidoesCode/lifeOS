const express = require("express");
const router = express.Router();
const { parseMemory } = require("../ai/memoryParser");
const auth = require("../middleware/auth");

router.post("/memory", async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ error: "Text required" });
    }

    const memory = await parseMemory(text);

    res.json({
      success: true,
      tasks: memory.tasks,
    });
  } catch (err) {
    console.error("AI error:", err.message);
    res.status(500).json({ error: "AI processing failed" });
  }
});

module.exports = router;
