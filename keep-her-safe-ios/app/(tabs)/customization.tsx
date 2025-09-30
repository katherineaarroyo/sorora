import React from "react";
// Core React Native components
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter } from "expo-router"; // Router for navigation
import { Ionicons } from "@expo/vector-icons"; // Icons for features

export default function CustomizationScreen() {
  const router = useRouter(); // Initialize router for navigation

  // List of customization features with their corresponding navigation paths
  const features: {
    name: string;
    path: string;
    icon: keyof typeof Ionicons.glyphMap;
  }[] = [
    //{ name: "Accessibility Options", path: "(customization)/accessibility" },
    //{ name: "Alarm Settings", path: "(customization)/alarms" },
    //{ name: "Check-in Mode", path: "(customization)/check-in" },
    {
      name: "Alert Message",
      path: "(customization)/custom-alert",
      icon: "alert-circle-outline",
    },
    {
      name: "Emergency Contacts",
      path: "(customization)/contacts",
      icon: "call-outline",
    },
    //{ name: "Family/Guardian Mode", path: "(customization)/family-mode" },
    //{ name: "Language Preferences", path: "(customization)/language" },
    //{ name: "Location Settings", path: "(customization)/location" },
    //{ name: "Neighborhood Watch Feature", path: "(customization)/neighborhood-watch" },
    //{ name: "Smart Appliances", path: "(customization)/smart-appliances" },
    //{ name: "Theme/Appearance", path: "(customization)/theme" },
    //{ name: "Voice Activation", path: "(customization)/voice-activation" },
  ];

  // Render the customization menu UI with a scrollable list of feature buttons
  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView style={styles.container}>
        {/* Map over features array to render each feature as a touchable button */}
        {features.map((feature) => (
          // Each feature
          <TouchableOpacity
            key={feature.name} // Unique key for list rendering
            onPress={() => router.push(feature.path as any)} // Navigate on press
            style={styles.button}
          >
            {/* Left side: icon + text */}
            <View style={styles.leftContent}>
              <Ionicons
                name={feature.icon}
                size={22}
                color="#E37B80"
                style={styles.leftIcon}
              />
              <Text style={styles.buttonText}>{feature.name}</Text>
            </View>

            {/* Right side: arrow icon */}
            <Ionicons
              name="chevron-forward-outline"
              size={20}
              color="#E37B80"
            />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// Stylesheet for all styles used in the component
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8EDED",
    padding: 16,
  }, // Container style for main ScrollView

  button: {
    backgroundColor: "#F6D4D7",
    padding: 16,
    borderRadius: 8,
    marginTop: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  }, // Style for each feature button

  leftContent: {
    flexDirection: "row",
    alignItems: "center",
  }, // Style for icon + text container

  leftIcon: {
    marginRight: 12,
  }, // Style for icon spacing

  buttonText: {
    fontSize: 16,
  }, // Style for button text
});
