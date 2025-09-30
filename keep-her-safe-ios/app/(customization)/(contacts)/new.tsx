// Import necessary React and React Native modules
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";

// Import router navigation hook
import { useRouter } from "expo-router";

// Import Firebase Firestore instance
import { firestore } from "../../../firebase/config";
import { collection, addDoc, getDocs } from "firebase/firestore";

// Import Firebase Authentication
import { getAuth } from "firebase/auth";

// Import phone number validation utility
import { isValidPhoneNumber } from "../../../utils/phoneValidation";

export default function NewContactScreen() {
  const router = useRouter();

  // State for contact name input
  const [name, setName] = useState("");

  // State for contact phone number input
  const [phoneNumber, setPhoneNumber] = useState("");

  // Handle saving the new contact
  const handleSave = async () => {
    const auth = getAuth();
    const user = auth.currentUser;

    // Ensure user is signed in
    if (!user) {
      Alert.alert("Error", "You must be signed in to add a contact.");
      return;
    }

    // Validate fields are not empty
    if (!name.trim() || !phoneNumber.trim()) {
      Alert.alert("Validation Error", "Please fill out all fields.");
      return;
    }

    // Validate phone number format
    if (!isValidPhoneNumber(phoneNumber)) {
      Alert.alert("Invalid Phone Number", "Please enter a valid phone number.");
      return;
    }

    try {
      // Reference the subcollection: users/<uid>/contacts
      const contactsRef = collection(firestore, "users", user.uid, "contacts");
      const snapshot = await getDocs(contactsRef);

      // Limit contacts to 5 maximum
      if (snapshot.size >= 5) {
        Alert.alert(
          "Limit Reached",
          "You can only save up to 5 emergency contacts."
        );
        return;
      }

      // Save the new contact to Firestore
      await addDoc(contactsRef, {
        name,
        phoneNumber,
        createdAt: new Date(),
      });

      Alert.alert("Success", "Contact added.");
      router.back(); // Navigate back to contact list screen
    } catch (error) {
      console.error("Error adding contact:", error);
      Alert.alert("Error", "Failed to add contact.");
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView style={styles.container}>
        {/* Title heading */}
        <Text style={styles.header}>{"Add Emergency Contact"}</Text>

        {/* Input field for contact name */}
        <TextInput
          style={styles.input}
          placeholder="Name"
          value={name}
          onChangeText={setName}
        />

        {/* Input field for contact phone number */}
        <TextInput
          style={styles.input}
          placeholder="Phone Number"
          keyboardType="phone-pad"
          value={phoneNumber}
          onChangeText={setPhoneNumber}
        />

        {/* Button to save the contact */}
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>{"Save Contact"}</Text>
        </TouchableOpacity>
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

  // Save button
  saveButton: {
    backgroundColor: "#E37B80",
    flex: 0.85,
    marginRight: 10,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 24,
  },

  // Save button text
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
