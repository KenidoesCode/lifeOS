const express = require("express");
const router = express.Router();
const User = require("../models/User");

router.post("/register", async (req, res) => {
  const { pushToken } = req.body;
  if (!pushToken) {
    return res.status(400).json({ error: "Push token required" });
  }

  let user = await User.findOne();
  if (!user) {
    user = new User({ pushToken });
  } else {
    user.pushToken = pushToken;
  }

  await user.save();
  res.json({ success: true });
});

module.exports = router;
