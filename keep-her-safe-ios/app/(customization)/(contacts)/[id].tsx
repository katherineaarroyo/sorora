// Import React and React Native essentials
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";

// Import Expo Router utilities
import { useLocalSearchParams, useRouter } from "expo-router";

// Import Firebase config and Firestore helpers
import { auth, firestore } from "../../../firebase/config";
import { doc, setDoc, getDoc, deleteDoc } from "firebase/firestore";

// Import phone number validation utility
import { isValidPhoneNumber } from "../../../utils/phoneValidation";

export default function ContactFormScreen() {
  // Get the contact ID from route params ('new' or Firestore doc ID)
  const { id } = useLocalSearchParams();
  const router = useRouter();

  // State for form fields
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  // State for loading indicator
  const [loading, setLoading] = useState(true);

  // Check if user is editing an existing contact
  const isEditing = id !== "new";

  // Fetch contact details if editing
  useEffect(() => {
    if (isEditing && typeof id === "string") {
      const fetchContact = async () => {
        try {
          const docRef = doc(
            firestore,
            "users",
            auth.currentUser?.uid!,
            "contacts",
            id
          );
          const snapshot = await getDoc(docRef);

          if (snapshot.exists()) {
            const data = snapshot.data();
            setName(data.name);
            setPhoneNumber(data.phoneNumber);
          } else {
            Alert.alert("Error", "Contact not found.");
            router.back(); // Navigate back if not found
          }
        } catch (error) {
          console.error("Error fetching contact:", error);
          Alert.alert("Error", "Failed to load contact.");
        } finally {
          setLoading(false);
        }
      };

      fetchContact();
    } else {
      setLoading(false);
    }
  }, [id, isEditing, router]);

  // Save new or updated contact
  const handleSave = async () => {
    if (!name.trim() || !phoneNumber.trim()) {
      return Alert.alert("Validation Error", "All fields are required.");
    }

    if (!isValidPhoneNumber(phoneNumber)) {
      return Alert.alert(
        "Validation Error",
        "Please enter a valid phone number."
      );
    }

    try {
      setLoading(true);

      // Create new doc ID if adding, otherwise update existing
      const docRef = doc(
        firestore,
        "users",
        auth.currentUser?.uid!,
        "contacts",
        typeof id === "string" && id !== "new" ? id : Date.now().toString()
      );

      await setDoc(docRef, {
        name: name.trim(),
        phoneNumber: phoneNumber.trim(),
      });

      Alert.alert("Success", "Contact saved successfully.");
      router.back(); // Return to previous screen
    } catch (error) {
      console.error("Error saving contact:", error);
      Alert.alert("Error", "Failed to save contact.");
    } finally {
      setLoading(false);
    }
  };

  // Delete existing contact
  const handleDelete = async () => {
    if (!isEditing || typeof id !== "string") return;

    Alert.alert(
      "Confirm Delete",
      "Are you sure you want to delete this contact?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              setLoading(true);
              const docRef = doc(
                firestore,
                "users",
                auth.currentUser?.uid!,
                "contacts",
                id
              );
              await deleteDoc(docRef);
              Alert.alert("Deleted", "Contact has been deleted.");
              router.back();
            } catch (error) {
              console.error("Delete error:", error);
              Alert.alert("Error", "Failed to delete contact.");
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  // Show loading indicator while fetching or saving
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView style={styles.container}>
        {/* Title changes depending on edit or add */}
        <Text style={styles.header}>{"Edit Your Contact"}</Text>

        {/* Input for contact full name */}
        <TextInput
          placeholder="Full Name"
          value={name}
          onChangeText={setName}
          style={styles.input}
        />

        {/* Input for contact phone number */}
        <TextInput
          placeholder="Phone Number"
          value={phoneNumber}
          onChangeText={setPhoneNumber}
          style={styles.input}
          keyboardType="phone-pad"
        />

        {/* Container for Save and Delete buttons side by side */}
        <View style={styles.buttonRow}>
          {/* Save button */}
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>{"Save Message"}</Text>
          </TouchableOpacity>
          {/* Delete button */}
          <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
            <Ionicons name="trash-outline" size={20} color="white" />
          </TouchableOpacity>
        </View>
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
  header: {
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
    marginTop: 8,
    marginBottom: 8,
    backgroundColor: "white",
    minHeight: 15,
    textAlignVertical: "top",
  },

  // Row container for Save and Delete buttons
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 24,
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
