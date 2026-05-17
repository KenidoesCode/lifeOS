import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Switch,
  TextInput,
  Image,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import * as Notifications from 'expo-notifications';
import { useFocusEffect } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';

const BASE_URL = 'http://192.168.29.235:5000';

const ProfileScreen = () => {
  const { user, token, logout, updateUser } = useAuth();
  const navigation = useNavigation();
  const [stats, setStats] = useState({
    completedToday: 0,
    totalCompleted: 0,
    totalPending: 0,
  });
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState(user?.name || '');
  const [notificationsEnabled, setNotificationsEnabled] = useState(
    user?.notificationsEnabled ?? true
  );
  const [reminderTime, setReminderTime] = useState(
    user?.reminderTime || '08:00 AM'
  );
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedHour, setSelectedHour] = useState(8);
  const [selectedMinute, setSelectedMinute] = useState(0);
  const [selectedPeriod, setSelectedPeriod] = useState('AM');
  const [savingName, setSavingName] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      fetchStats();
      loadProfilePhoto();
    }, [token])
  );

  const fetchStats = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${BASE_URL}/api/tasks/stats`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (err) {
      console.log('Stats error:', err);
    }
  };

  const loadProfilePhoto = async () => {
    const saved = await AsyncStorage.getItem('profilePhoto');
    if (saved) setProfilePhoto(saved);
  };

  const handlePickPhoto = () => {
    Alert.alert('Profile Photo', 'Choose photo source', [
      {
        text: 'Camera',
        onPress: async () => {
          const { status } =
            await ImagePicker.requestCameraPermissionsAsync();
          if (status !== 'granted') {
            Alert.alert(
              'Permission Required',
              'Please allow camera access'
            );
            return;
          }
          const result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.5,
          });
          if (!result.canceled) {
            const uri = result.assets[0].uri;
            setProfilePhoto(uri);
            await AsyncStorage.setItem('profilePhoto', uri);
          }
        },
      },
      {
        text: 'Gallery',
        onPress: async () => {
          const { status } =
            await ImagePicker.requestMediaLibraryPermissionsAsync();
          if (status !== 'granted') {
            Alert.alert(
              'Permission Required',
              'Please allow gallery access'
            );
            return;
          }
          const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.5,
          });
          if (!result.canceled) {
            const uri = result.assets[0].uri;
            setProfilePhoto(uri);
            await AsyncStorage.setItem('profilePhoto', uri);
          }
        },
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const handleSaveName = async () => {
    if (!editedName.trim()) {
      Alert.alert('Error', 'Name cannot be empty');
      return;
    }
    setSavingName(true);
    try {
      const res = await fetch(`${BASE_URL}/api/auth/update-profile`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: editedName.trim() }),
      });
      if (res.ok) {
        const updatedUser = await res.json();
        updateUser(updatedUser);
        setIsEditingName(false);
        Alert.alert('Saved', 'Name updated successfully');
      }
    } catch {
      Alert.alert('Error', 'Could not update name');
    }
    setSavingName(false);
  };

  const handleToggleNotifications = async (value) => {
    setNotificationsEnabled(value);
    if (value) {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Please enable notifications in device settings'
        );
        setNotificationsEnabled(false);
        return;
      }
    }
    try {
      await fetch(`${BASE_URL}/api/auth/update-profile`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ notificationsEnabled: value }),
      });
    } catch (err) {
      console.log('Notification update error:', err);
    }
  };

  const saveReminderTime = async () => {
    const timeString = `${selectedHour
      .toString()
      .padStart(2, '0')}:${selectedMinute
      .toString()
      .padStart(2, '0')} ${selectedPeriod}`;

    try {
      await Notifications.cancelAllScheduledNotificationsAsync();

      let hour24 = selectedHour;
      if (selectedPeriod === 'PM' && selectedHour !== 12)
        hour24 = selectedHour + 12;
      if (selectedPeriod === 'AM' && selectedHour === 12) hour24 = 0;

      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'LifeOS Daily Check-in',
          body: "What's on your mind today? Organize your thoughts!",
          sound: 'default',
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour: hour24,
          minute: selectedMinute,
        },
      });

      await AsyncStorage.setItem('reminderTime', timeString);
      await fetch(`${BASE_URL}/api/auth/update-profile`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reminderTime: timeString }),
      });

      setReminderTime(timeString);
      setShowTimePicker(false);
      Alert.alert('Saved', `Daily reminder set for ${timeString}`);
    } catch (err) {
      console.log('Schedule error:', err);
      await AsyncStorage.setItem('reminderTime', timeString);
      setReminderTime(timeString);
      setShowTimePicker(false);
      Alert.alert('Saved', `Reminder time saved for ${timeString}`);
    }
  };

  const handleClearTasks = () => {
    Alert.alert(
      'Clear All Tasks',
      'This will permanently delete all your tasks. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            try {
              const res = await fetch(`${BASE_URL}/api/tasks/clear`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
              });
              if (res.ok) {
                Alert.alert('Done', 'All tasks cleared!');
                fetchStats();
              }
            } catch {
              Alert.alert('Error', 'Could not clear tasks');
            }
          },
        },
      ]
    );
  };

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: logout },
    ]);
  };

  const getInitial = () =>
    user?.name?.charAt(0).toUpperCase() || 'U';

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.pageTitle}>Profile</Text>
        </View>

        {/* Avatar - centered */}
        <View style={styles.avatarSection}>
          <TouchableOpacity
            onPress={handlePickPhoto}
            style={styles.avatarContainer}
          >
            {profilePhoto ? (
              <Image
                source={{ uri: profilePhoto }}
                style={styles.avatarImage}
              />
            ) : (
              <View style={styles.avatarFallback}>
                <Text style={styles.avatarLetter}>{getInitial()}</Text>
              </View>
            )}
            <View style={styles.cameraOverlay}>
              <Text style={styles.cameraText}>Edit</Text>
            </View>
          </TouchableOpacity>

          {/* Name - editable */}
          {isEditingName ? (
            <View style={styles.editNameRow}>
              <TextInput
                style={styles.nameInput}
                value={editedName}
                onChangeText={setEditedName}
                autoFocus
                selectTextOnFocus
              />
              <TouchableOpacity
                onPress={handleSaveName}
                disabled={savingName}
                style={styles.nameActionBtn}
              >
                {savingName ? (
                  <ActivityIndicator size="small" color="#7C3AED" />
                ) : (
                  <Text style={styles.saveText}>Save</Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setIsEditingName(false)}
                style={styles.nameActionBtn}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              onPress={() => {
                setEditedName(user?.name || '');
                setIsEditingName(true);
              }}
              style={styles.nameRow}
            >
              <Text style={styles.userName}>{user?.name || 'User'}</Text>
              <Text style={styles.editHint}> (tap to edit)</Text>
            </TouchableOpacity>
          )}

          <Text style={styles.userEmail}>
            {user?.email || (user?.isGuest ? 'Guest Account' : '')}
          </Text>

          {user?.isGuest && (
            <View style={styles.guestBadge}>
              <Text style={styles.guestBadgeText}>Guest</Text>
            </View>
          )}

          <Text style={styles.memberSince}>
            Member since {formatDate(user?.createdAt || '')}
          </Text>
        </View>

        {/* Stats - 3 cards: total tasks, done today, upcoming */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              {stats.totalCompleted + stats.totalPending}
            </Text>
            <Text style={styles.statLabel}>Total Tasks</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.completedToday}</Text>
            <Text style={styles.statLabel}>Done Today</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.totalPending}</Text>
            <Text style={styles.statLabel}>Upcoming</Text>
          </View>
        </View>

        {/* Settings */}
        <Text style={styles.sectionTitle}>PREFERENCES</Text>
        <View style={styles.settingsCard}>
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Notifications</Text>
            <Switch
              value={notificationsEnabled}
              onValueChange={handleToggleNotifications}
              trackColor={{ false: '#333', true: '#7C3AED' }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={styles.separator} />

          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => setShowTimePicker(true)}
          >
            <Text style={styles.settingLabel}>Daily Reminder</Text>
            <Text style={styles.settingValue}>{reminderTime}</Text>
          </TouchableOpacity>

          <View style={styles.separator} />

          <TouchableOpacity
            style={styles.settingItem}
            onPress={handleClearTasks}
          >
            <Text style={styles.dangerLabel}>Clear All Tasks</Text>
          </TouchableOpacity>
        </View>

        {/* Account */}
        <Text style={styles.sectionTitle}>ACCOUNT</Text>

        {user?.isGuest && (
          <TouchableOpacity
            style={styles.saveDataCard}
            onPress={() => navigation.navigate('Register' as never)}
          >
            <View style={styles.saveDataText}>
              <Text style={styles.saveDataTitle}>Save your progress</Text>
              <Text style={styles.saveDataSubtitle}>
                Create an account to keep your data
              </Text>
            </View>
            <Text style={styles.saveDataArrow}>→</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={styles.logoutCard}
          onPress={handleLogout}
        >
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Time Picker Modal */}
      <Modal
        visible={showTimePicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowTimePicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Set Daily Reminder</Text>

            <View style={styles.timePickerRow}>
              <View style={styles.timeColumn}>
                <Text style={styles.timeLabel}>HOUR</Text>
                <TouchableOpacity
                  onPress={() =>
                    setSelectedHour((h) => (h === 12 ? 1 : h + 1))
                  }
                >
                  <Text style={styles.arrow}>▲</Text>
                </TouchableOpacity>
                <Text style={styles.timeValue}>
                  {selectedHour.toString().padStart(2, '0')}
                </Text>
                <TouchableOpacity
                  onPress={() =>
                    setSelectedHour((h) => (h === 1 ? 12 : h - 1))
                  }
                >
                  <Text style={styles.arrow}>▼</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.timeSeparator}>:</Text>

              <View style={styles.timeColumn}>
                <Text style={styles.timeLabel}>MIN</Text>
                <TouchableOpacity
                  onPress={() =>
                    setSelectedMinute((m) => (m === 55 ? 0 : m + 5))
                  }
                >
                  <Text style={styles.arrow}>▲</Text>
                </TouchableOpacity>
                <Text style={styles.timeValue}>
                  {selectedMinute.toString().padStart(2, '0')}
                </Text>
                <TouchableOpacity
                  onPress={() =>
                    setSelectedMinute((m) => (m === 0 ? 55 : m - 5))
                  }
                >
                  <Text style={styles.arrow}>▼</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.timeColumn}>
                <Text style={styles.timeLabel}>PERIOD</Text>
                <TouchableOpacity
                  style={styles.periodButton}
                  onPress={() =>
                    setSelectedPeriod((p) => (p === 'AM' ? 'PM' : 'AM'))
                  }
                >
                  <Text style={styles.periodText}>{selectedPeriod}</Text>
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={styles.saveButton}
              onPress={saveReminderTime}
            >
              <Text style={styles.saveButtonText}>Save Reminder</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelModalButton}
              onPress={() => setShowTimePicker(false)}
            >
              <Text style={styles.cancelModalText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000' },
  header: { padding: 24, paddingTop: 16 },
  pageTitle: {
    fontSize: 34,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -1,
  },
  avatarSection: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  avatarContainer: { position: 'relative', marginBottom: 16 },
  avatarImage: { width: 90, height: 90, borderRadius: 45 },
  avatarFallback: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#7C3AED',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLetter: { color: '#FFFFFF', fontSize: 36, fontWeight: '700' },
  cameraOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: '#333',
  },
  cameraText: { color: '#AAAAAA', fontSize: 11 },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  userName: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
  },
  editHint: { color: '#555555', fontSize: 13 },
  editNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  nameInput: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600',
    borderBottomWidth: 1,
    borderBottomColor: '#7C3AED',
    paddingVertical: 4,
    minWidth: 150,
    textAlign: 'center',
  },
  nameActionBtn: { paddingHorizontal: 8, paddingVertical: 4 },
  saveText: { color: '#7C3AED', fontSize: 14, fontWeight: '600' },
  cancelText: { color: '#EF4444', fontSize: 14 },
  userEmail: {
    color: '#666666',
    fontSize: 14,
    marginBottom: 8,
    textAlign: 'center',
  },
  guestBadge: {
    backgroundColor: 'rgba(245,158,11,0.15)',
    borderRadius: 100,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginBottom: 8,
  },
  guestBadgeText: { color: '#F59E0B', fontSize: 12, fontWeight: '600' },
  memberSince: {
    color: '#444444',
    fontSize: 12,
    textAlign: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#111111',
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1A1A1A',
  },
  statNumber: {
    color: '#7C3AED',
    fontSize: 26,
    fontWeight: '800',
    marginBottom: 4,
  },
  statLabel: {
    color: '#555555',
    fontSize: 11,
    textAlign: 'center',
    fontWeight: '500',
  },
  sectionTitle: {
    color: '#444444',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    paddingHorizontal: 24,
    marginBottom: 8,
  },
  settingsCard: {
    marginHorizontal: 24,
    marginBottom: 24,
    backgroundColor: '#111111',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#1A1A1A',
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  settingLabel: { color: '#FFFFFF', fontSize: 15 },
  settingValue: { color: '#7C3AED', fontSize: 14 },
  dangerLabel: { color: '#EF4444', fontSize: 15 },
  separator: {
    height: 1,
    backgroundColor: '#1A1A1A',
    marginHorizontal: 16,
  },
  saveDataCard: {
    marginHorizontal: 24,
    marginBottom: 12,
    backgroundColor: '#111111',
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#7C3AED',
  },
  saveDataText: { flex: 1 },
  saveDataTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  saveDataSubtitle: { color: '#666666', fontSize: 13 },
  saveDataArrow: { color: '#7C3AED', fontSize: 18 },
  logoutCard: {
    marginHorizontal: 24,
    marginBottom: 12,
    backgroundColor: '#111111',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2A1A1A',
  },
  logoutText: { color: '#EF4444', fontSize: 15, fontWeight: '600' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#111111',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    borderTopWidth: 1,
    borderColor: '#222222',
  },
  modalTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 32,
  },
  timePickerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 24,
    marginBottom: 32,
  },
  timeColumn: { alignItems: 'center' },
  timeLabel: {
    color: '#555555',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 12,
  },
  arrow: { color: '#7C3AED', fontSize: 20, paddingVertical: 8 },
  timeValue: {
    color: '#FFFFFF',
    fontSize: 48,
    fontWeight: '800',
    width: 80,
    textAlign: 'center',
  },
  timeSeparator: {
    color: '#FFFFFF',
    fontSize: 48,
    fontWeight: '800',
    marginBottom: 20,
  },
  periodButton: {
    backgroundColor: 'rgba(124,58,237,0.2)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(124,58,237,0.4)',
    marginTop: 20,
  },
  periodText: { color: '#7C3AED', fontSize: 18, fontWeight: '700' },
  saveButton: {
    backgroundColor: '#7C3AED',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 8,
  },
  saveButtonText: { color: '#FFFFFF', fontWeight: '700', fontSize: 16 },
  cancelModalButton: { padding: 16, alignItems: 'center' },
  cancelModalText: { color: '#666666', fontSize: 16 },
});

export default ProfileScreen;
