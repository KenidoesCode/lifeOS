import React, { useState, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  FlatList, ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';

const BASE_URL = 'http://192.168.29.235:5000';

interface Task {
  _id: string;
  title: string;
  priority: 'High' | 'Medium' | 'Low';
  completed: boolean;
  dueAt?: string;
}

const PRIORITY_COLORS = {
  High: '#EF4444',
  Medium: '#F59E0B',
  Low: '#22C55E',
};

const TodayScreen = () => {
  const { token } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      fetchTasks();
    }, [])
  );

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${BASE_URL}/api/tasks/today`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setTasks(Array.isArray(data) ? data : []);
    } catch (err) {
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  const completeTask = async (id: string) => {
    try {
      await fetch(`${BASE_URL}/api/tasks/${id}/complete`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchTasks();
    } catch (err) {}
  };

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric'
  });

  const renderGroup = (priority: 'High' | 'Medium' | 'Low') => {
    const group = tasks.filter(t => t.priority === priority);
    if (group.length === 0) return null;
    const color = PRIORITY_COLORS[priority];
    return (
      <View key={priority} style={styles.group}>
        <View style={styles.priorityHeader}>
          <View style={[styles.dot, { backgroundColor: color }]} />
          <Text style={[styles.priorityLabel, { color }]}>
            {priority.toUpperCase()}
          </Text>
        </View>
        {group.map(task => (
          <TouchableOpacity
            key={task._id}
            style={[styles.taskCard, { borderLeftColor: color }]}
            onPress={() => completeTask(task._id)}
          >
            <View style={[styles.checkbox, { borderColor: color }]} />
            <Text style={styles.taskTitle}>{task.title}</Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator
          size="large"
          color="#7C3AED"
          style={{ flex: 1 }}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Today</Text>
        <Text style={styles.date}>{today}</Text>
      </View>

      {tasks.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>You're all clear!!</Text>
        </View>
      ) : (
        <FlatList
          data={['High', 'Medium', 'Low'] as const}
          keyExtractor={(item) => item}
          renderItem={({ item }) => renderGroup(item)}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000' },
  header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 20 },
  title: {
    color: '#FFFFFF',
    fontSize: 34,
    fontWeight: '800',
    letterSpacing: -1,
    marginBottom: 4,
  },
  date: { color: '#666666', fontSize: 14 },
  list: { paddingHorizontal: 20, paddingBottom: 40 },
  group: { marginBottom: 24 },
  priorityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  dot: { width: 6, height: 6, borderRadius: 3 },
  priorityLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 1 },
  taskCard: {
    backgroundColor: '#111111',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderLeftWidth: 3,
    borderWidth: 1,
    borderColor: '#1A1A1A',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
  },
  taskTitle: { color: '#FFFFFF', fontSize: 15, flex: 1 },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: { color: '#333333', fontSize: 18, fontWeight: '600' },
});

export default TodayScreen;
