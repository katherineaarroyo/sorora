// app/(settings)/_layout.tsx
import React from "react";
import { Stack } from "expo-router";
import { TouchableOpacity, Text, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

export default function SettingsLayout() {
  const router = useRouter();

  return (
    <Stack
      screenOptions={({ route }) => ({
        headerShown: true,
        animation: "slide_from_right",
        title: route.name, // Title of the current screen
        header: ({ navigation, route, options }) => {
          // Map route.name to a nicer title
          const titles: Record<string, string> = {
            about: "About Us",
            "delete-account": "Delete Account",
          };
          const currentTitle = titles[route.name] || route.name;

          return (
            // Custom header container
            <View style={styles.header}>
              {/* Back button that navigates to Settings */}
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => router.push("/settings")}
              >
                {/* Back arrow icon */}
                <Ionicons name="arrow-back" size={26} color="#E37B80" />
                {/* Screen title text */}
                <Text style={styles.headerTitle}>{currentTitle}</Text>
              </TouchableOpacity>
            </View>
          );
        },
      })}
    >
      {/* Manually define screen titles here */}
      <Stack.Screen name="about" options={{ title: "About Us" }} />
      <Stack.Screen
        name="delete-account"
        options={{ title: "Delete Account" }}
      />
    </Stack>
  );
}

const styles = StyleSheet.create({
  // Styles for the entire header container
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

  // Styles for the back button row (arrow + title)
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 2,
  },

  // Styles for the title text in the header
  headerTitle: {
    color: "#E37B80",
    fontSize: 24,
    fontWeight: "bold",
    marginLeft: 6,
    marginBottom: 1,
  },
});
