// app/(auth)/_layout.tsx

// React + hooks
import { useEffect, useState } from "react";

// Expo Router for navigation + path tracking
import { Stack, useRouter, usePathname } from "expo-router";

// Firebase authentication
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "../../firebase/config";

export default function AuthLayout() {
  // Router navigation helper
  const router = useRouter();
  // Tracks current path
  const pathname = usePathname();

  // State to check if Firebase is still loading user
  const [initializing, setInitializing] = useState(true);
  // Holds user info (null if logged out)
  const [user, setUser] = useState<User | null>(null);

  // Runs once to set up Firebase authentication state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (usr) => {
      setUser(usr); // update user state
      if (initializing) setInitializing(false); // stop loading once first check is done

      if (usr) {
        // If user exists and isn’t already on tabs, redirect
        if (pathname !== "/(tabs)") {
          router.replace("/(tabs)");
          console.log("User logged in, redirecting to tabs");
        }
      } else {
        // If no user and isn’t already on login, redirect
        if (pathname !== "/login") {
          router.replace("/login");
          console.log("No user, redirecting to login");
        }
      }
    });

    // Cleanup listener on unmount
    return unsubscribe;
  }, [pathname, initializing, router]);

  // While checking user state, render nothing
  if (initializing) return null;

  // Stack handles navigation for this layout with header hidden
  return <Stack screenOptions={{ headerShown: false }} />;
}
