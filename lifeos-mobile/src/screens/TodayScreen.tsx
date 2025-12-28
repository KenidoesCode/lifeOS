import React, { useEffect, useState , Fragment } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";

type Task = {
  _id: string;
  title: string;
  priority: "High" | "Medium" | "Low";
};

const TodayScreen = () => {
  const [tasks, setTasks] = useState([] as Task[]);
  const [loading, setLoading] = useState(true);

  const fetchTodayTasks = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/tasks/today");
      const data: Task[] = await res.json();
      setTasks(data);
    } catch (err) {
      console.error("Failed to fetch today tasks");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTodayTasks();
  }, []);

  const completeTask = async (id: string) => {
    await fetch(`http://localhost:5000/api/tasks/${id}/complete`, {
      method: "PATCH",
    });
    fetchTodayTasks();
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const renderGroup = (
    priority: "High" | "Medium" | "Low",
    color: string
  ) => {
    const group = tasks.filter(
      (task: Task) => task.priority === priority
    );

    if (!group.length) return null;

    return (
      <View>
        <Text style={styles.group}>{priority}</Text>

        {group.map((task: Task) => (
  <Fragment key={task._id}>
    <TouchableOpacity
      style={[styles.task, { borderLeftColor: color }]}
      onPress={() => completeTask(task._id)}
    >
      <Text style={styles.taskText}>{task.title}</Text>
    </TouchableOpacity>
  </Fragment>
))}




      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Today</Text>
      {renderGroup("High", "#e53935")}
      {renderGroup("Medium", "#fbc02d")}
      {renderGroup("Low", "#43a047")}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "600",
    marginBottom: 16,
  },
  group: {
    marginTop: 20,
    fontSize: 14,
    color: "#777",
  },
  task: {
    padding: 14,
    marginTop: 8,
    borderRadius: 8,
    backgroundColor: "#f7f7f7",
    borderLeftWidth: 4,
  },
  taskText: {
    fontSize: 16,
  },
});

export default TodayScreen;
