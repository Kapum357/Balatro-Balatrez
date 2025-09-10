import { FontAwesome5 } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { Platform } from "react-native";
import { Theme } from "../constants/Theme";
import { GameProvider } from "../contexts/GameContext";

export default function TabsLayout() {
  return (
    <GameProvider>
      <Tabs
        initialRouteName="index"
        screenOptions={{
          tabBarStyle: {
        backgroundColor: Theme.colors.bg,
        borderTopWidth: 2,
        borderTopColor: Theme.colors.border,
        height: Platform.OS === 'ios' ? 88 : 68,
        paddingBottom: Platform.OS === 'ios' ? 28 : 8,
        paddingTop: 8,
          },
          tabBarActiveTintColor: Theme.colors.accent,
          tabBarInactiveTintColor: Theme.colors.textFaint,
          tabBarLabelStyle: {
        fontFamily: Theme.typography.fontPixel,
        fontSize: 12,
        marginTop: 4,
          },
          headerStyle: {
        backgroundColor: Theme.colors.bg,
        borderBottomWidth: 2,
        borderBottomColor: Theme.colors.border,
          },
          headerTitleStyle: {
        fontFamily: Theme.typography.fontPixel,
        fontSize: Theme.typography.sizes.large,
          },
          headerTintColor: Theme.colors.text,
          lazy: false, // Preload all tabs
        }}
      >
        <Tabs.Screen
          name="home"
          options={{
        title: "Home",
        tabBarIcon: ({ color, size }) => (
          <FontAwesome5 name="home" size={size} color={color} solid />
        ),
        headerShown: true,
        headerTransparent: true,
        headerTitle: '',  // Remove header title since we have it in the content
        tabBarHideOnKeyboard: true,
          }}
        />
        <Tabs.Screen
          name="play"
          options={{
        title: "Play",
        tabBarIcon: ({ color, size }) => (
          <FontAwesome5 name="dice" size={size} color={color} solid />
        ),
          }}
        />
        <Tabs.Screen
          name="tutorial"
          options={{
        title: "Tutorial",
        tabBarIcon: ({ color, size }) => (
          <FontAwesome5 name="book" size={size} color={color} solid />
        ),
          }}
        />
        <Tabs.Screen
          name="game"
          options={{
        title: "Game",
        tabBarIcon: ({ color, size }) => (
          <FontAwesome5 name="gamepad" size={size} color={color} solid />
        ),
          }}
        />
        <Tabs.Screen
          name="index"
          options={{ href: null }}
        />
      </Tabs>
    </GameProvider>
  );
}