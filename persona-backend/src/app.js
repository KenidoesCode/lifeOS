const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json({ limit: "1mb" }));

app.get("/health", (_, res) => res.json({ status: "ok", time: new Date().toISOString() }));

app.use("/api/tasks", require("./routes/tasks"));
app.use("/api/ai", require("./routes/ai"));
app.use("/api/notifications", require("./routes/notifications"));

module.exports = app;

