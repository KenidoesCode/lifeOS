import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";

import ChatScreen from "../screens/ChatScreen";
import TodayScreen from "../screens/TodayScreen";
import TimelineScreen from "../screens/TimelineScreen";

const Tab = createBottomTabNavigator();

const AppNavigator = () => {
    return (
        <NavigationContainer>
            <Tab.Navigator screenOptions={{ headerShown: false}}>
                <Tab.Screen name="Chat" component={ChatScreen} />
                <Tab.Screen name="Today" component={TodayScreen} />
                <Tab.Screen name="Timeline" component={TimelineScreen} />
            </Tab.Navigator>
        </NavigationContainer>
    )
}

export default AppNavigator;