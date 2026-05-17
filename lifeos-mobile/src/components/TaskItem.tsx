import React from "react";
import { Text, TouchableOpacity, StyleSheet, ViewStyle } from "react-native";
import type { Task } from "../types/Task";

interface TaskItemProps {
  task: Task;
  onComplete: (id: string) => void;
}

const priorityColor: Record<Task["priority"], string> = {
  High: "#e53935",
  Medium: "#fbc02d",
  Low: "#43a047",
};

export default function TaskItem({ task, onComplete }: TaskItemProps) {
  const cardStyle: ViewStyle = { borderLeftColor: priorityColor[task.priority] };

  return (
    <TouchableOpacity style={[styles.card, cardStyle]} onPress={() => onComplete(task._id)}>
      <Text style={styles.title}>{task.title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 14,
    borderRadius: 12,
    backgroundColor: "#f7f7f7",
    borderLeftWidth: 4,
    marginTop: 8,
  },
  title: {
    fontSize: 16,
    color: "#111",
  },
});

