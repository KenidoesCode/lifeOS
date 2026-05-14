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
  dueAt: string;
  completed: boolean;
}

const PRIORITY_COLORS = {
  High: '#EF4444',
  Medium: '#F59E0B',
  Low: '#22C55E',
};

const TimelineScreen = () => {
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
      const res = await fetch(`${BASE_URL}/api/tasks/upcoming`, {
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

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow';
    
    return date.toLocaleDateString('en-US', {
      weekday: 'short', month: 'short', day: 'numeric'
    });
  };

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString('en-US', {
      hour: 'numeric', minute: '2-digit', hour12: true
    });
  };

  const getGroupLabel = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow';
    
    const diffDays = Math.floor(
      (date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (diffDays <= 7) return date.toLocaleDateString('en-US', { weekday: 'long' });
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Group tasks by date
  const grouped = tasks.reduce((acc, task) => {
    const label = getGroupLabel(task.dueAt);
    if (!acc[label]) acc[label] = [];
    acc[label].push(task);
    return acc;
  }, {} as Record<string, Task[]>);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#7C3AED" style={{ flex: 1 }} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Upcoming</Text>
        <Text style={styles.subtitle}>
          {tasks.length > 0 
            ? `${tasks.length} task${tasks.length > 1 ? 's' : ''} coming up` 
            : 'Your schedule ahead'}
        </Text>
      </View>

      {tasks.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>Nothing coming up</Text>
        </View>
      ) : (
        <FlatList
          data={Object.entries(grouped)}
          keyExtractor={([label]) => label}
          renderItem={({ item: [label, groupTasks] }) => (
            <View style={styles.group}>
              <Text style={styles.groupLabel}>{label}</Text>
              {groupTasks.map(task => (
                <View key={task._id} style={styles.taskCard}>
                  <View style={[
                    styles.priorityDot,
                    { backgroundColor: PRIORITY_COLORS[task.priority] }
                  ]} />
                  <View style={styles.taskInfo}>
                    <Text style={styles.taskTitle}>{task.title}</Text>
                    <Text style={styles.taskDate}>
                      {formatDate(task.dueAt)}, {formatTime(task.dueAt)}
                    </Text>
                  </View>
                  <View style={styles.taskCircle} />
                </View>
              ))}
            </View>
          )}
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
  subtitle: { color: '#666666', fontSize: 14 },
  list: { paddingHorizontal: 20, paddingBottom: 40 },
  group: { marginBottom: 24 },
  groupLabel: {
    color: '#666666',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 10,
    letterSpacing: 0.3,
  },
  taskCard: {
    backgroundColor: '#111111',
    borderRadius: 14,
    padding: 16,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: '#1A1A1A',
  },
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  taskInfo: { flex: 1 },
  taskTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 3,
  },
  taskDate: { color: '#666666', fontSize: 12 },
  taskCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#333333',
    backgroundColor: '#1A1A1A',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: { color: '#333333', fontSize: 18, fontWeight: '600' },
});

export default TimelineScreen;
