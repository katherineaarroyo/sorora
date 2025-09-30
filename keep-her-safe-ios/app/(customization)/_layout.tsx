// app/(customization)/_layout.tsx

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

// Main layout component for settings-related screens
export default function CustomizationScreensLayout() {
  const router = useRouter(); // Router instance for navigation

  return (
    <Stack
      screenOptions={({ route }) => {
        // Inside the contacts stack, hide the parent header, taken care of by (contacts)/_layout.tsx
        if (route.name === "(contacts)") {
          return {
            headerShown: false,
          };
        }

        return {
          headerShown: true, // Always show header
          animation: "slide_from_right", // Slide transition animation
          title: route.name, // Default title (fallback)

          // Custom header logic
          header: ({ route }) => {
            // Map internal route names to user-friendly titles
            const titles: Record<string, string> = {
              "custom-alert": "Alert Message",
              contacts: "Emergency Contacts",
            };

            // Pick the correct title for current screen
            const currentTitle = titles[route.name] || route.name;

            return (
              <View style={styles.header}>
                {/* Back button to return to customization menu */}
                <TouchableOpacity
                  style={styles.backButton}
                  onPress={() => router.push("/customization")}
                >
                  {/* Back arrow icon */}
                  <Ionicons name="arrow-back" size={26} color="#E37B80" />
                  {/* Header text showing current screen title */}
                  <Text style={styles.headerTitle}>{currentTitle}</Text>
                </TouchableOpacity>
              </View>
            );
          },
        };
      }}
    >
      {/* Define the sub-screens available under this layout */}
      <Stack.Screen name="custom-alert" options={{ title: "Alert Message" }} />
      <Stack.Screen name="contacts" options={{ title: "Emergency Contacts" }} />
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
