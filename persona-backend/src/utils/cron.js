const cron = require("node-cron");
const Task = require("../models/Task");

cron.schedule("*/5 * * * *", async () => {
    const now = new Date();

    const tasks = await Task.find({
        remindAt: {$lte: now },
        notified: false,
        completed: false,
    });

    for (let task of tasks) {
        console.log("🔔REMINDER:",task.title);

        task.notified = true;
        await task.save();
    }
});