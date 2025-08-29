// app/(customization)/custom-alert.tsx

import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteField,
} from "firebase/firestore";
import { firestore, auth, db } from "../../firebase/config";
import { Ionicons } from "@expo/vector-icons";

export default function CustomAlert() {
  // State for holding the custom message
  const [message, setMessage] = useState("");
  // State for showing loading indicator while fetching or saving
  const [loading, setLoading] = useState(true);

  // Fetch the custom alert message when component mounts
  useEffect(() => {
    const fetchMessage = async () => {
      try {
        // Reference to the user's document in Firestore
        const userDocRef = doc(firestore, "users", auth.currentUser?.uid!);
        const snapshot = await getDoc(userDocRef);

        // If user doc exists and has a customMessage, set it in state
        if (snapshot.exists()) {
          const data = snapshot.data();
          if (data.customMessage) {
            setMessage(data.customMessage);
          }
        }
      } catch (error) {
        console.error("Error fetching custom alert:", error);
        Alert.alert("Error", "Failed to load custom alert message.");
      } finally {
        setLoading(false); // Stop loading after fetch attempt
      }
    };

    fetchMessage();
  }, []);

  // Delete custom message handler
  const handleDelete = async () => {
    Alert.alert(
      "Delete Custom Message",
      "Are you sure you want to remove your custom alert message? This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const user = auth.currentUser;

              // If no user is signed in, stop
              if (!user) {
                Alert.alert("Error", "No user is currently signed in.");
                return;
              }

              // Reference the user’s document
              const userRef = doc(db, "users", user.uid);

              // Remove only the customMessage field
              await updateDoc(userRef, {
                customMessage: deleteField(),
              });

              setMessage(""); // clear textbox in UI
              Alert.alert("Success", "Custom message deleted successfully.");
            } catch (error) {
              console.error("Error deleting custom message:", error);
              Alert.alert("Error", "Failed to delete the custom message.");
            }
          },
        },
      ]
    );
  };

  // Function to save the custom message back to Firestore
  const handleSave = async () => {
    if (!message.trim()) {
      return Alert.alert("Validation Error", "Message cannot be empty.");
    }

    try {
      setLoading(true); // Show loading while saving

      // Reference to the user's document
      const userDocRef = doc(firestore, "users", auth.currentUser?.uid!);

      // Save/update the field "customMessage"
      await setDoc(
        userDocRef,
        { customMessage: message.trim() },
        { merge: true } // Merge to avoid overwriting other fields
      );

      Alert.alert("Success", "Custom alert message saved.");
    } catch (error) {
      console.error("Error saving custom alert:", error);
      Alert.alert("Error", "Failed to save custom alert message.");
    } finally {
      setLoading(false); // Stop loading after save attempt
    }
  };

  // UI for displaying and editing the custom alert
  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView style={styles.container}>
        {/* Page Title */}
        <Text style={styles.label}>{"Customizing Your Alert"}</Text>

        {/* Explanation of page message */}
        <Text style={styles.message}>
          {
            "This feature lets you write your own personalized SOS alert that will be sent to your emergency contacts when you press the SOS button."
          }
        </Text>
        <Text style={styles.message}>
          {
            "Your live location will always be added to the end of the message automatically. If no custom message is set, the app will send the default emergency alert."
          }
        </Text>

        {/* Show loading spinner while fetching/saving */}
        {loading ? (
          <ActivityIndicator size="large" color="#E37B80" />
        ) : (
          <>
            {/* Text input for editing the custom alert message */}
            <TextInput
              style={styles.input}
              placeholder="Enter your custom alert message"
              value={message}
              onChangeText={setMessage}
              multiline
            />

            {/* Container for Save and Delete buttons side by side */}
            <View style={styles.buttonRow}>
              {/* Save button */}
              <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                <Text style={styles.saveButtonText}>{"Save Message"}</Text>
              </TouchableOpacity>
              {/* Delete button */}
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={handleDelete}
              >
                <Ionicons name="trash-outline" size={20} color="white" />
              </TouchableOpacity>
            </View>
          </>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// Styles for the component
const styles = StyleSheet.create({
  // Main screen container
  container: {
    flex: 1,
    padding: 32,
    backgroundColor: "#F8EDED",
  },

  // Main Title
  label: {
    fontSize: 28,
    fontWeight: "bold",
    marginTop: 32,
    marginBottom: 32,
  },

  // Message text styling
  message: {
    fontSize: 16,
    color: "#333",
    marginBottom: 16,
  },

  // Text input box
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginTop: 32,
    marginBottom: 16,
    backgroundColor: "white",
    minHeight: 100,
    textAlignVertical: "top",
  },

  // Row container for Save and Delete buttons
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 16,
  },

  // Save button
  saveButton: {
    backgroundColor: "#E37B80",
    flex: 0.85,
    marginRight: 10,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },

  // Save button text
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },

  // Delete button
  deleteButton: {
    backgroundColor: "#dc2626",
    flex: 0.15,
    marginLeft: 10,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },

  // Delete button text
  deleteText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },

  // Loading screen container
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
