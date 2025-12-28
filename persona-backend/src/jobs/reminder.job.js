const cron = require("node-cron");
const fetch = require("node-fetch");
const Task = require("../models/Task");
const User = require("../models/User");

// ⏰ TASK REMINDERS
cron.schedule("*/5 * * * *", async () => {
  const now = new Date();
  const windowEnd = new Date(now.getTime() + 30 * 60 * 1000);

  const tasks = await Task.find({
    completed: false,
    reminderSent: false,
    dueAt: { $gte: now, $lte: windowEnd },
  });

  for (const task of tasks) {
    const user = await User.findById(task.user);
    if (!user?.pushToken) continue;

    await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        to: user.pushToken,
        title: "LifeOS Reminder",
        body: task.title,
      }),
    });

    task.reminderSent = true;
    await task.save();
  }
});

// 🌅 DAILY HABIT NOTIFICATION (8 AM)
cron.schedule("0 8 * * *", async () => {
  const users = await User.find({ pushToken: { $exists: true } });

  for (const user of users) {
    await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        to: user.pushToken,
        title: "LifeOS",
        body: "What’s on your mind today?",
      }),
    });
  }
});
