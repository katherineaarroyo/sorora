// app/(customization)/delete-account.tsx

import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  StyleSheet,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { getAuth, deleteUser } from "firebase/auth";
import {
  collection,
  deleteDoc,
  getDocs,
  getFirestore,
} from "firebase/firestore";

export default function DeleteAccountScreen() {
  const router = useRouter();

  // State to hold the text typed into the confirmation box
  const [confirmText, setConfirmText] = useState("");

  // Handle the deletion of the account.
  const handleDeleteAccount = async () => {
    // Require "delete" to be typed in before continuing
    if (confirmText.trim().toLowerCase() !== "delete") {
      Alert.alert(
        "Confirmation Required",
        'Please type "delete" in the box before continuing.'
      );
      return;
    }

    // Show final confirmation popup
    Alert.alert(
      "Confirm Deletion",
      "Are you sure you want to permanently delete your account and all associated data?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const auth = getAuth();
              const db = getFirestore();
              const user = auth.currentUser;

              // If no user is signed in, stop
              if (!user) {
                Alert.alert("Error", "No user is currently signed in.");
                return;
              }

              const uid = user.uid;

              // STEP 1: Delete all documents in the "contacts" subcollection
              const contactsRef = collection(db, "users", uid, "contacts");
              const contactsSnapshot = await getDocs(contactsRef);
              const deletePromises = contactsSnapshot.docs.map((docSnap) =>
                deleteDoc(docSnap.ref)
              );
              await Promise.all(deletePromises);

              // STEP 2: Delete the user account itself from Firebase Authentication
              await deleteUser(user);

              // STEP 3: Notify user and redirect to login screen
              Alert.alert(
                "Account Deleted",
                "Your account and data have been deleted."
              );
              router.replace("/login"); // navigate to login screen
            } catch (error: any) {
              console.error("Error deleting account:", error);

              // Show error popup if anything fails
              Alert.alert(
                "Error",
                error.message || "Failed to delete account."
              );
            }
          },
        },
      ]
    );
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView style={styles.container}>
        {/* Screen Title */}
        <Text style={styles.title}>{"Deleting Your Account"}</Text>

        {/* First warning about deletion */}
        <Text style={styles.warning}>
          {"Deleting your account will permanently remove all of your data."}
        </Text>
        <Text style={styles.warning}>
          {
            "This action cannot be undone. Once your account is deleted, you will not be able to recover any of your information."
          }
        </Text>

        {/* Second warning + instructions for typing "delete" */}
        <Text style={styles.confirm}>
          {"To confirm, please type"}{" "}
          <Text style={{ fontWeight: "bold" }}>{"'delete'"}</Text>
          {"in the box below."}
        </Text>

        {/* Input box where user must type "delete" */}
        <TextInput
          style={styles.input}
          placeholder='Type "delete" here'
          value={confirmText}
          onChangeText={setConfirmText}
          autoCapitalize="none"
        />

        {/* Delete button */}
        <TouchableOpacity
          style={[
            styles.deleteButton,
            confirmText.trim().toLowerCase() !== "delete"
              ? { backgroundColor: "#fca5a5" }
              : null,
          ]}
          onPress={handleDeleteAccount}
        >
          <Text style={styles.deleteButtonText}>{"Delete Account"}</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  // Outer container for the whole screen
  container: {
    flex: 1,
    padding: 32,
    backgroundColor: "#F8EDED",
  },

  // Main title styling
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginTop: 32,
    marginBottom: 32,
  },

  // Warning text styling
  warning: {
    fontSize: 16,
    color: "#333",
    marginBottom: 16,
  },

  // Confirm text styling
  confirm: {
    fontSize: 14,
    color: "#757575ff",
    marginTop: 32,
    marginBottom: 16,
  },

  // Input box where "delete" must be typed
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
    backgroundColor: "white",
  },

  // Delete button styling (default red)
  deleteButton: {
    backgroundColor: "#dc2626",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
  },

  // Delete button text styling
  deleteButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
});
