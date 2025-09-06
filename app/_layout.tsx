import { Stack } from "expo-router";
import React from "react";

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{title: "Home"}} />
      <Stack.Screen name="game" />
      <Stack.Screen name="login" />
      <Stack.Screen name="play" />
      <Stack.Screen name="tutorial" />
    </Stack>
  );
}