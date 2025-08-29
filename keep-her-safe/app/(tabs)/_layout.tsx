// Import tab navigator and router from Expo Router
import { Tabs, useRouter } from "expo-router";

// Import Ionicons for tab icons
import { Ionicons } from "@expo/vector-icons";
import HomeBanner from "../../assets/images/home-banner.svg";

// React and necessary providers
import React from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";

import { Text, TouchableOpacity, View } from "react-native";

// Map each tab route name to a corresponding Ionicon
const ICONS_MAP: Record<string, keyof typeof Ionicons.glyphMap> = {
  index: "home",
  customization: "color-palette",
  settings: "settings",
  profile: "person-circle-outline",
};

// Header title component that redirects to home when clicked
function HeaderTitleClickable({ title }: { title: string }) {
  const router = useRouter();

  // Show back arrow if we're not on Home
  const showBackArrow = title !== "Home";

  // If on Home, show the clickable logo banner
  if (title === "Home") {
    return (
      <TouchableOpacity
        onPress={() => router.push("/")} // Clicking logo takes user to Home
        style={{ flexDirection: "row", alignItems: "center" }} // Layout for logo
      >
        {/* Home banner logo */}
        <HomeBanner width={200} height={100} />
      </TouchableOpacity>
    );
  }

  // If not Home, show back arrow + page title
  return (
    <TouchableOpacity
      onPress={() => {
        if (showBackArrow) {
          router.push("/"); // Clicking back arrow navigates home
        }
      }}
      style={{ flexDirection: "row", alignItems: "center" }}
      disabled={!showBackArrow} // Disable press if no back arrow
    >
      {/* Conditionally render back arrow */}
      {showBackArrow ? (
        <Ionicons
          name="arrow-back"
          size={26}
          color="#E37B80"
          style={{ marginRight: 6 }}
        />
      ) : null}

      {/* Title text beside arrow or centered if no arrow */}
      <Text
        style={{
          color: "#E37B80",
          fontWeight: "bold",
          fontSize: 24,
          paddingLeft: showBackArrow ? 0 : 26, // Push text if no arrow
        }}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
}

// Main layout for the tab navigator
export default function TabLayout() {
  return (
    // Enables gesture support for bottom sheets and swipes
    <GestureHandlerRootView style={{ flex: 1 }}>
      {/* Provider for bottom sheet components */}
      <BottomSheetModalProvider>
        <Tabs
          screenOptions={({ route }) => {
            // Get correct icon name for tab
            const iconName = ICONS_MAP[route.name] ?? "ellipse";

            // Define header titles for each route
            const title =
              {
                index: "Home",
                customization: "Customization",
                settings: "Settings",
                profile: "Profile",
              }[route.name] ?? "App";

            return {
              // Tab bar icon for each screen
              tabBarIcon: ({ color, size }) => (
                <Ionicons name={iconName} size={size} color={color} />
              ),
              headerShown: true, // Always show header
              headerTitle: () => <HeaderTitleClickable title={title} />, // Custom header with back/logo
              tabBarStyle: {
                // Styles for bottom tab bar
                backgroundColor: "#F8EDED",
                borderColor: "#E37B80",
                borderTopWidth: 2,
                borderBottomWidth: 0,
                elevation: 0,
              },
              tabBarActiveTintColor: "#E37B80", // Active tab color
              tabBarInactiveTintColor: "gray", // Inactive tab color
            };
          }}
        >
          {/* Define each tab screen */}
          <Tabs.Screen name="index" options={{ title: "Home" }} />
          <Tabs.Screen
            name="customization"
            options={{ title: "Customization" }}
          />
          <Tabs.Screen name="settings" options={{ title: "Settings" }} />
          <Tabs.Screen name="profile" options={{ title: "Profile" }} />
        </Tabs>
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
}
