import React, { Fragment } from "react";
import { View, Text, StyleSheet } from "react-native";
import type { Priority, Task } from "../types/Task";
import TaskItem from "./TaskItem";

interface TaskListProps {
  tasks: Task[];
  onComplete: (id: string) => void;
}

const priorityOrder: Priority[] = ["High", "Medium", "Low"];

export default function TaskList({ tasks, onComplete }: TaskListProps) {
  const renderGroup = (priority: Priority) => {
    const group = tasks.filter((t) => t.priority === priority);
    if (!group.length) return null;

    return (
      <View>
        <Text style={styles.groupLabel}>{priority}</Text>
        {group.map((task) => (
          <Fragment key={task._id}>
            <TaskItem task={task} onComplete={onComplete} />
          </Fragment>
        ))}
      </View>
    );
  };

  return <View>{priorityOrder.map((p) => <Fragment key={p}>{renderGroup(p)}</Fragment>)}</View>;
}

const styles = StyleSheet.create({
  groupLabel: {
    marginTop: 20,
    fontSize: 14,
    color: "#777",
  },
});

