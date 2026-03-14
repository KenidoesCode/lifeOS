import React, { useEffect, useState, useCallback, Fragment } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";

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
      console.log("Fetching today tasks...");
      const res = await fetch("http://10.0.2.2:5000/api/tasks/today");
      console.log("Response status:", res.status);
      const data: Task[] = await res.json();
      console.log("Tasks data:", JSON.stringify(data));
      setTasks(data);
    } catch (err) {
      console.log("Error fetching tasks:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchTodayTasks();
    }, [])
  );

  const completeTask = async (id: string) => {
    await fetch(`http://10.0.2.2:5000/api/tasks/${id}/complete`, {
      method: "PATCH",
    });
    fetchTodayTasks();
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.center}>
          <ActivityIndicator color="#7C5CFC" size="large" />
        </View>
      </SafeAreaView>
    );
  }

  const renderGroup = (
    priority: "High" | "Medium" | "Low",
    color: string,
    label: string
  ) => {
    const group = tasks.filter(
      (task: Task) => task.priority === priority
    );

    if (!group.length) return null;

    return (
      <View key={priority}>
        <Text style={[styles.group, { color }]}>● {label}</Text>

        {group.map((task: Task) => (
          <Fragment key={task._id}>
            <TouchableOpacity
              style={[styles.task, { borderLeftColor: color }]}
              onPress={() => completeTask(task._id)}
            >
              <View style={styles.checkbox}>
                <View style={styles.checkboxInner} />
              </View>
              <Text style={styles.taskText}>{task.title}</Text>
            </TouchableOpacity>
          </Fragment>
        ))}
      </View>
    );
  };

  const today = new Date();
  const dateStr = today.toLocaleDateString('en-US', { 
    weekday: 'long', 
    month: 'long', 
    day: 'numeric' 
  });

  if (tasks.length === 0) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Today</Text>
            <Text style={styles.date}>{dateStr}</Text>
          </View>
          <View style={styles.center}>
            <Text style={styles.emptyState}>You're all clear!!</Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Today</Text>
          <Text style={styles.date}>{dateStr}</Text>
        </View>
        
        {renderGroup("High", "#FF6B6B", "HIGH")}
        {renderGroup("Medium", "#FFB347", "MEDIUM")}
        {renderGroup("Low", "#6BCB77", "LOW")}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#0F0F0F",
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    backgroundColor: "#0F0F0F",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    paddingTop: 20,
    paddingBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    color: "#F0F0F0",
    marginBottom: 4,
  },
  date: {
    fontSize: 16,
    color: "#888888",
    fontWeight: "400",
  },
  group: {
    marginTop: 24,
    marginBottom: 12,
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  task: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1A1A1A",
    padding: 16,
    marginBottom: 8,
    borderRadius: 12,
    borderLeftWidth: 3,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#2A2A2A",
    marginRight: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxInner: {
    width: 0,
    height: 0,
    borderRadius: 5,
    backgroundColor: "#7C5CFC",
  },
  taskText: {
    flex: 1,
    fontSize: 15,
    color: "#F0F0F0",
    fontWeight: "500",
  },
  emptyState: {
    fontSize: 18,
    color: "#555555",
    fontWeight: "500",
  },
});

export default TodayScreen;
