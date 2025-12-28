const mongoose = require("mongoose");

const TaskSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: String,

    dueAt: {
      type: Date,
      index: true,
    },

    priority: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Medium",
      index: true,
    },

    type: {
      type: String,
      enum: ["task", "habit", "goal"],
      default: "task",
    },

    recurring: {
      type: String,
      enum: ["daily", "weekly", "monthly", null],
      default: null,
    },

    completed: {
      type: Boolean,
      default: false,
      index: true,
    },

    source: {
      type: String,
      enum: ["manual", "voice", "chat", "ai"],
      default: "manual",
    },

    reminderSent: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  { timestamps: true }
);

// ---- COMPOUND INDEXES (CRITICAL) ----
TaskSchema.index({ user: 1, dueAt: 1 });
TaskSchema.index({ user: 1, completed: 1 });

module.exports = mongoose.model("Task", TaskSchema);
