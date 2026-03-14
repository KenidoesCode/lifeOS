import { useEffect } from "react";
import { Platform } from "react-native";
import * as Notifications from "expo-notifications";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { registerRootComponent } from "expo";
import AppNavigator from "./src/navigation/AppNavigator";

const BACKEND_URL = "http://10.0.2.2:5000";

async function registerForPushNotifications() {
  try {
    if (Platform.OS === "web") return;

    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.MAX,
      });
    }

    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") return;

    const token = await Notifications.getExpoPushTokenAsync({
      projectId: "lifeos",
    });

    await fetch(`${BACKEND_URL}/api/notifications/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pushToken: token.data }),
    });
  } catch (err) {
    // fail silently
  }
}

function App() {
  useEffect(() => {
    registerForPushNotifications();
  }, []);

  return (
    <SafeAreaProvider>
      <AppNavigator />
    </SafeAreaProvider>
  );
}

export default registerRootComponent(App);

