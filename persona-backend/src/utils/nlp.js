function extractTask(text){
    const task = {
        title: text,
        priority: "medium",
        dueAt: null,
        remindAt: null,
    };

    if (text.includes("urgent") || text.includes("high")) {
        task.priority = "high";
    }

    if(text.includes("tomorrow")) {
        const d = new Date();
        d.setDate(d.getDate() + 1);
        d.setHours(18,0,0);
        task.dueAt = d;
        task.remindAt = new Date(d.getTime() - 30 * 60000);
}
    return task;
}

module.exports = extractTask;