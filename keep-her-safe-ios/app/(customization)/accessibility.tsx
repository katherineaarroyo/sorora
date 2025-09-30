//// To be implemented: Accessibility settings screen
// app/(tabs)/customization/(subpages)/accessibility.tsx

import React from "react";
import { View, Text, StyleSheet } from "react-native";

export const unstable_settings = {
  tabBarStyle: { display: "none" }, // Hide tab bar completely on this screen
  tabBarButton: () => null, // Hide tab button so it doesn't show in tabs
};

export default function AccessibilityScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Accessibility Settings</Text>
      {/* Your content */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
  },
});
