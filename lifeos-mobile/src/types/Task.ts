export type TaskType = "task" | "habit" | "goal";
export type Priority = "High" | "Medium" | "Low";
export type RecurringType = "daily" | "weekly" | "monthly" | null;

export interface Task {
  _id: string;
  title: string;
  priority: Priority;
  type: TaskType;
  recurring: RecurringType;
  dueAt: string | null;
  completed: boolean;
  source: "manual" | "voice" | "chat" | "ai";
  reminderSent: boolean;
  createdAt: string;
  updatedAt: string;
}

