import React from "react";
import { View, ActivityIndicator, Text } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import { useAuth } from "../context/AuthContext";
import WelcomeScreen from "../screens/WelcomeScreen";
import LoginScreen from "../screens/LoginScreen";
import RegisterScreen from "../screens/RegisterScreen";
import ForgotPasswordScreen from "../screens/ForgotPasswordScreen";
import ChatScreen from "../screens/ChatScreen";
import TodayScreen from "../screens/TodayScreen";
import TimelineScreen from "../screens/TimelineScreen";
import ProfileScreen from "../screens/ProfileScreen";

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();
const MainStackNav = createStackNavigator();

const AuthStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Welcome" component={WelcomeScreen} />
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Register" component={RegisterScreen} />
    <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
  </Stack.Navigator>
);

const TabIcon = ({ symbol, focused }) => (
  <Text style={{
    fontSize: 16,
    color: focused ? "#7C3AED" : "#555555",
    fontWeight: focused ? "700" : "400",
  }}>
    {symbol}
  </Text>
);

const MainTabs = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      headerShown: false,
      tabBarShowLabel: true,
      tabBarActiveTintColor: "#7C3AED",
      tabBarInactiveTintColor: "#555555",
      tabBarIcon: ({ focused }) => {
        const icons = {
          Chat: "◆",
          Today: "●",
          Upcoming: "◎",
          Profile: "○",
        };
        return <TabIcon symbol={icons[route.name]} focused={focused} />;
      },
      tabBarStyle: {
        backgroundColor: "#000000",
        borderTopColor: "#1A1A1A",
        borderTopWidth: 1,
        height: 65,
        paddingBottom: 8,
        paddingTop: 4,
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
    <Tab.Screen name="Profile" component={ProfileScreen} />
  </Tab.Navigator>
);

const MainApp = () => (
  <MainStackNav.Navigator screenOptions={{ headerShown: false }}>
    <MainStackNav.Screen name="MainTabs" component={MainTabs} />
    <MainStackNav.Screen name="Register" component={RegisterScreen} />
    <MainStackNav.Screen name="Login" component={LoginScreen} />
  </MainStackNav.Navigator>
);

const AppNavigator = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{
        flex: 1,
        backgroundColor: "#000000",
        alignItems: "center",
        justifyContent: "center",
      }}>
        <ActivityIndicator size="large" color="#7C3AED" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {user ? <MainApp /> : <AuthStack />}
    </NavigationContainer>
  );
};

export default AppNavigator;
