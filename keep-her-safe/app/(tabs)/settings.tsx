import React from "react";
// Core React Native components
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter } from "expo-router"; // Router for navigation
import { getAuth, signOut } from "firebase/auth"; // Firebase auth for sign out
import { Ionicons } from "@expo/vector-icons"; // Icons for settings items

// Settings screen component for app/(tabs)/settings.tsx
export default function SettingsScreen() {
  const router = useRouter();

  // Sign out the user and redirect to login
  const handleSignOut = async () => {
    const auth = getAuth();
    try {
      await signOut(auth);
      router.replace("/login"); // redirect after sign out
    } catch (error) {
      Alert.alert("Error", "Failed to sign out.");
    }
  };

  // Settings feature list with names, icons, and navigation paths
  const features: {
    name: string;
    icon: keyof typeof Ionicons.glyphMap;
    path: string;
  }[] = [
    {
      name: "About Us",
      icon: "information-circle-outline",
      path: "(settings)/about",
    },
    {
      name: "Delete Account",
      icon: "trash-outline",
      path: "(settings)/delete-account",
    },
    //{ name: "Notification Settings", icon: "notifications-outline", path: "(settings)/notifications" },
    //{ name: "Feedback/Support", icon: "help-circle-outline", path: "(settings)/feedback" },
    //{ name: "PIN Creation and Editing", icon: "key-outline", path: "(settings)/pin" },
  ];

  // Render the settings UI with sign out button, list of features, and delete account button
  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView style={styles.container}>
        {/* Map over features array to render each feature as a touchable item */}
        {features.map((feature) => (
          // Each settings feature
          <TouchableOpacity
            key={feature.name}
            onPress={() => router.push(feature.path as any)} // Navigate to feature screen on press
            style={styles.featureButton}
          >
            {/* Left: icon + text */}
            <View style={styles.leftContent}>
              <Ionicons
                name={feature.icon}
                size={22}
                color="#E37B80"
                style={styles.leftIcon}
              />
              <Text style={styles.featureText}>{feature.name}</Text>
            </View>

            {/* Right: arrow */}
            <Ionicons name="chevron-forward" size={20} color="#E37B80" />
          </TouchableOpacity>
        ))}

        <View style={styles.signOutContainer}>
          {/* Sign Out button */}
          <TouchableOpacity
            onPress={handleSignOut} // Handle user sign out on press
            style={styles.signOutButton}
          >
            {/* Text label inside the sign out button */}
            <Text style={styles.signOutText}>{"Sign Out"}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// Stylesheet for all styles used in the SettingsScreen
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8EDED",
    padding: 16,
  }, // Main container for scrollview

  signOutContainer: {
    alignItems: "center",
    marginTop: 32,
  }, // Container for sign out button

  signOutButton: {
    width: "40%",
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E37B80",
    borderRadius: 8,
  }, // Style for sign out button

  signOutText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  }, // Text inside the sign out button

  featureButton: {
    backgroundColor: "#F6D4D7",
    padding: 16,
    borderRadius: 8,
    marginTop: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  }, // Style for each settings feature button

  leftContent: {
    flexDirection: "row",
    alignItems: "center",
  }, // Container for icon + text on the left

  leftIcon: {
    marginRight: 12,
  }, // Spacing between icon and text

  featureText: {
    fontSize: 16,
    color: "#333",
  }, // Text style for feature name
});
