// app/(customization)/contacts/_layout.tsx

// Import core React
import React from "react";

// Import navigation stack from Expo Router
import { Stack } from "expo-router";

// Import React Native components for UI
import { TouchableOpacity, Text, StyleSheet, View } from "react-native";

// Import Ionicons for back button icon
import { Ionicons } from "@expo/vector-icons";

// Import useRouter for navigation control
import { useRouter } from "expo-router";

// Main layout component for contacts-related screens
export default function ContactsScreensLayout() {
  const router = useRouter(); // Router instance for navigation

  return (
    <Stack
      screenOptions={({ route }) => ({
        headerShown: true, // Always show header
        animation: "slide_from_right", // Slide transition animation
        title: route.name, // Default title (fallback)

        // Custom header logic
        header: ({ route }) => {
          // Map internal route names to user-friendly titles
          const titles: Record<string, string> = {
            new: "Add Contact",
            "[id]": "Edit Contact", // fallback title for dynamic contact screen
          };

          // Pick the correct title for current screen
          const currentTitle = titles[route.name] || route.name;

          return (
            <View style={styles.header}>
              {/* Back button to return to emergency contacts list */}
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => router.push("/(customization)/contacts")}
              >
                {/* Back arrow icon */}
                <Ionicons name="arrow-back" size={26} color="#E37B80" />
                {/* Header text showing current screen title */}
                <Text style={styles.headerTitle}>{currentTitle}</Text>
              </TouchableOpacity>
            </View>
          );
        },
      })}
    >
      {/* Define the sub-screens available under this layout */}
      <Stack.Screen name="new" options={{ title: "Add Contact" }} />
      <Stack.Screen name="[id]" options={{ title: "Edit Contact" }} />
    </Stack>
  );
}

// Styles

// Header container style (height, padding, background, shadow)
const styles = StyleSheet.create({
  header: {
    height: 130,
    justifyContent: "flex-end",
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: "#fff",

    // iOS shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 4,

    // Android shadow
    elevation: 4,
  },

  // Back button row (arrow + text)
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 2,
  },

  // Title text beside back arrow
  headerTitle: {
    color: "#E37B80",
    fontSize: 24,
    fontWeight: "bold",
    marginLeft: 6,
    marginBottom: 1,
  },
});
