// app/(auth)/login.tsx

// Importing React and hooks for state management
import React, { useState } from "react";

// Importing React Native components for UI and styling
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";

// Importing Firebase authentication functions
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth";

// Importing Firebase authentication instance (configured in project)
import { auth } from "../../firebase/config";

// Expo Router for navigation + path tracking
import { useRouter } from "expo-router";

// Import icons/images if needed
import HomeBanner from "../../assets/images/home-banner.svg";

export default function LoginScreen() {
  // State for storing email input
  const [email, setEmail] = useState("");
  // State for storing password input
  const [password, setPassword] = useState("");
  // State to toggle between Login and Create Account
  const [isCreating, setIsCreating] = useState(false);
  // State for storing reset email input
  const [resetEmail, setResetEmail] = useState("");
  // State to show/hide password reset form
  const [showReset, setShowReset] = useState(false);
  // Router navigation helper
  const router = useRouter();

  // Function to handle authentication (login or account creation)
  const handleAuth = async () => {
    try {
      if (isCreating) {
        await createUserWithEmailAndPassword(auth, email, password);
        Alert.alert("Account created!");
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        Alert.alert("Logged in!");
      }
    } catch (error: any) {
      Alert.alert("Authentication error", error.message);
    }
  };

  // Function to handle sending password reset email
  const handleReset = async () => {
    if (!resetEmail) {
      Alert.alert("Please enter your email to reset password.");
      return;
    }
    try {
      await sendPasswordResetEmail(auth, resetEmail);
      Alert.alert("Password reset email sent!");
      setShowReset(false);
    } catch (error: any) {
      Alert.alert("Reset error", error.message);
    }
  };

  // Main render function for the login screen
  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView style={styles.container}>
        {/* Conditionally render Login/Create Account or Reset Password screen */}
        {!showReset ? (
          // Login or Create Account form
          <View>
            {/* Logo Banner */}
            <View style={styles.bannerContainer}>
              <HomeBanner height={95} />
            </View>

            {/* Screen header */}
            <Text style={styles.header}>
              {isCreating
                ? "Create a Sorora Account"
                : "Sign In to Your Sorora Account"}
            </Text>

            {/* Email input field */}
            <TextInput
              placeholder="Email"
              style={styles.input}
              onChangeText={setEmail}
              value={email}
              autoCapitalize="none"
            />

            {/* Password input field */}
            <TextInput
              placeholder="Password"
              secureTextEntry
              style={styles.input}
              onChangeText={setPassword}
              value={password}
            />
            {/* Login or Create Account button */}
            <TouchableOpacity
              style={styles.authButton} // apply custom styles
              onPress={handleAuth} // trigger login/create account
            >
              <Text style={styles.authButtonText}>
                {isCreating ? "Create Account" : "Sign In"}
              </Text>
            </TouchableOpacity>

            {/* Terms of Service blurb, shown only when creating an account */}
            {isCreating ? (
              <Text style={styles.tosMsg}>
                {"By creating an account, you agree to our"}{" "}
                <Text
                  style={styles.link}
                  onPress={() => router.push("/(auth)/tos")}
                >
                  {"Terms of Service."}
                </Text>
              </Text>
            ) : null}

            {/* Toggle link to switch between Login and Create Account */}
            <Text style={styles.toggle}>
              {isCreating ? (
                <>
                  {"Already have an account?"}{" "}
                  <Text
                    style={styles.link}
                    onPress={() => setIsCreating(false)}
                  >
                    {"Login!"}
                  </Text>
                </>
              ) : (
                <>
                  {"Don't have an account? "}{" "}
                  <Text style={styles.link} onPress={() => setIsCreating(true)}>
                    {"Create One!"}
                  </Text>
                </>
              )}
            </Text>

            {/* Forgot Password link */}
            <TouchableOpacity onPress={() => setShowReset(true)}>
              <Text style={[styles.toggle, styles.link]}>
                {"Forgot Password?"}
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          // Password reset form
          <View>
            {/* Logo Banner */}
            <View style={styles.bannerContainer}>
              <HomeBanner height={95} />
            </View>

            {/* Screen header for reset password */}
            <Text style={styles.header}>{"Reset Your Account Password"}</Text>

            {/* Reset email input field */}
            <TextInput
              placeholder="Enter your email"
              style={styles.input}
              onChangeText={setResetEmail}
              value={resetEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
            {/* Button to send reset email */}
            <TouchableOpacity style={styles.authButton} onPress={handleReset}>
              <Text style={styles.authButtonText}>{"Send Reset Email"}</Text>
            </TouchableOpacity>

            {/* Link to return back to login form */}
            <TouchableOpacity onPress={() => setShowReset(false)}>
              <Text style={[styles.toggle, styles.link]}>
                {"Return to Sign In Screen"}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// Styles
const styles = StyleSheet.create({
  container: {
    padding: 20,
    flex: 1,
    backgroundColor: "#fff",
  }, // Main container style

  // Style for the logo banner container
  bannerContainer: {
    marginTop: "40%",
    marginBottom: "30%",
  },

  input: {
    borderWidth: 1,
    padding: 10,
    marginVertical: 8,
    borderRadius: 5,
  }, // Style for text input fields (email, password, reset email)

  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  }, // Style for headers (Login, Create Account, Reset Password)

  toggle: {
    marginTop: 10,
    color: "blue",
    textAlign: "center",
  }, // Style for toggle text (links for switching forms)

  // Style for login/create/reset buttons
  authButton: {
    backgroundColor: "#E37B80",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 12,
    marginBottom: 8,
  },

  // Text style inside login/create/reset buttons
  authButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },

  // Style for Terms of Service blurb (shown only on Create Account)
  tosMsg: {
    fontSize: 12,
    color: "#555",
    marginTop: 12,
    marginBottom: 8,
    textAlign: "center",
  },

  // Style for clickable TOS link inside the blurb
  link: {
    color: "#1D4ED8", // blue link
    textDecorationLine: "underline",
  },
});
