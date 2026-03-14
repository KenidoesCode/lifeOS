import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";

const TimelineScreen = () => {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUpcomingTasks = async () => {
    try {
      console.log("Fetching upcoming tasks...");
      const res = await fetch("http://10.0.2.2:5000/api/tasks/upcoming");
      console.log("Upcoming response status:", res.status);
      const data = await res.json();
      console.log("Upcoming tasks data:", JSON.stringify(data));
      setTasks(data);
      setLoading(false);
    } catch (err) {
      console.log("Error fetching upcoming tasks:", err.message);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchUpcomingTasks();
    }, [])
  );

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Reset time for comparison
    const taskDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    
    if (taskDate.getTime() === today.getTime()) {
      return `Today, ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`;
    } else if (taskDate.getTime() === tomorrow.getTime()) {
      return `Tomorrow, ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`;
    } else {
      return date.toLocaleDateString('en-US', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    }
  };

  const renderTask = ({ item }: { item: any }) => (
    <View style={styles.task}>
      <View style={styles.accentBar} />
      <View style={styles.taskContent}>
        <Text style={styles.taskTitle}>{item.title}</Text>
        {item.dueAt && (
          <Text style={styles.taskDate}>{formatDate(item.dueAt)}</Text>
        )}
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.center}>
          <ActivityIndicator color="#7C5CFC" size="large" />
        </View>
      </SafeAreaView>
    );
  }

  if (tasks.length === 0) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Upcoming</Text>
            <Text style={styles.subtitle}>Your schedule ahead</Text>
          </View>
          <View style={styles.center}>
            <Text style={styles.emptyState}>Nothing coming up 🎉</Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Upcoming</Text>
          <Text style={styles.subtitle}>Your schedule ahead</Text>
        </View>
        
        <FlatList
          data={tasks}
          keyExtractor={item => item._id}
          renderItem={renderTask}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
        />
      </View>
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
  subtitle: {
    fontSize: 16,
    color: "#888888",
    fontWeight: "400",
  },
  listContent: {
    paddingBottom: 20,
  },
  task: {
    flexDirection: 'row',
    backgroundColor: "#1A1A1A",
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  accentBar: {
    width: 3,
    backgroundColor: "#7C5CFC",
    borderRadius: 2,
    marginRight: 16,
  },
  taskContent: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 15,
    color: "#F0F0F0",
    fontWeight: "500",
    marginBottom: 4,
  },
  taskDate: {
    fontSize: 13,
    color: "#888888",
    fontWeight: "400",
  },
  emptyState: {
    fontSize: 18,
    color: "#555555",
    fontWeight: "500",
  },
});

export default TimelineScreen;
