import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
} from "react-native";

const TimelineScreen = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:5000/api/tasks/upcoming")
      .then(res => res.json())
      .then(data => {
        setTasks(data);
        setLoading(false);
      });
  }, []);

  if (loading) return <ActivityIndicator style={{ flex: 1 }} />;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Upcoming</Text>

      <FlatList
        data={tasks}
        keyExtractor={item => item._id}
        renderItem={({ item }) => (
          <View style={styles.task}>
            <Text style={styles.text}>{item.title}</Text>
            {item.dueAt && (
              <Text style={styles.date}>
                {new Date(item.dueAt).toLocaleString()}
              </Text>
            )}
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  title: { fontSize: 28, fontWeight: "600", marginBottom: 16 },
  task: {
    padding: 14,
    borderRadius: 8,
    backgroundColor: "#f7f7f7",
    marginBottom: 10,
  },
  text: { fontSize: 16 },
  date: { fontSize: 13, color: "#666", marginTop: 4 },
});

export default TimelineScreen;
