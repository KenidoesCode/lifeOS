import React from "react";
import { Text } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";
import ChatScreen from "../screens/ChatScreen";
import TodayScreen from "../screens/TodayScreen";
import TimelineScreen from "../screens/TimelineScreen";

const Tab = createBottomTabNavigator();

const AppNavigator = () => (
  <NavigationContainer>
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused }) => {
          const icons: Record<string, string> = {
            Chat: "✦",
            Today: "◉",
            Upcoming: "◈",
          };
          return (
            <Text style={{ 
              fontSize: 18, 
              color: focused ? "#7C5CFC" : "#555555" 
            }}>
              {icons[route.name]}
            </Text>
          );
        },
        tabBarActiveTintColor: "#7C5CFC",
        tabBarInactiveTintColor: "#555555",
        tabBarStyle: {
          backgroundColor: "#0F0F0F",
          borderTopColor: "#2A2A2A",
          borderTopWidth: 1,
          height: 60,
          paddingBottom: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
        },
      })}
    >
      <Tab.Screen name="Chat" component={ChatScreen} />
      <Tab.Screen name="Today" component={TodayScreen} />
      <Tab.Screen name="Upcoming" component={TimelineScreen} />
    </Tab.Navigator>
  </NavigationContainer>
);

export default AppNavigator;