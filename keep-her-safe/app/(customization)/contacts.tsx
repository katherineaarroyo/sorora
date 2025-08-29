// Contacts list screen: shows user's emergency contacts with live Firestore updates and navigation to detail/new pages.

import React, { useEffect, useState } from "react";
// React Native UI primitives
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
// Expo Router for navigation
import { useRouter } from "expo-router";
// Firestore helpers (real-time listener)
import { collection, onSnapshot } from "firebase/firestore";
// App Firebase instances
import { auth, db } from "../../firebase/config";

// Contact shape for local state
interface Contact {
  id: string;
  name: string;
  phoneNumber: string;
}

export default function ContactsScreen() {
  const router = useRouter();
  const [contacts, setContacts] = useState<Contact[]>([]);

  useEffect(() => {
    // Guard: require a logged-in user before listening to Firestore
    if (!auth.currentUser?.uid) return;

    // Reference the signed-in user's contacts collection in Firestore
    const contactsRef = collection(
      db,
      "users",
      auth.currentUser.uid,
      "contacts"
    );

    // Subscribe to live updates from Firestore
    const unsubscribe = onSnapshot(
      contactsRef,
      (snapshot) => {
        const contactList: Contact[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<Contact, "id">),
        }));
        setContacts(contactList); // Update local state with latest data
      },
      (error) => {
        console.error("Error fetching contacts:", error);
        Alert.alert("Error", "Failed to load emergency contacts.");
      }
    );

    // Cleanup: stop listening when component unmounts
    return () => unsubscribe();
  }, []);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView style={styles.container}>
        {/* Page title */}
        <Text style={styles.header}>{"Emergency Contacts"}</Text>

        {/* Explanation of page  */}
        <Text style={styles.message}>
          {
            "Tap a contact to view or edit their details. You can add multiple emergency contacts who will be notified when you trigger an SOS alert."
          }
        </Text>

        {/* Render each contact as a tappable card */}
        {contacts.map((contact) => (
          <TouchableOpacity
            key={contact.id}
            style={styles.contactCard}
            // Navigate to contact details (dynamic route with id)
            onPress={() =>
              router.push({
                pathname: "/(customization)/(contacts)/[id]",
                params: { id: contact.id },
              })
            }
          >
            <Text style={styles.name}>{contact.name}</Text>
            <Text style={styles.phone}>{contact.phoneNumber}</Text>
          </TouchableOpacity>
        ))}

        {/* CTA: add a new emergency contact */}
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push("/(customization)/(contacts)/new" as any)}
        >
          <Text style={styles.addButtonText}>{"+ Add New Contact"}</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// Styles for the contacts screen (single-line comments per block to keep intent clear)
const styles = StyleSheet.create({
  // Root scroll container with padding and white background
  container: {
    flex: 1,
    backgroundColor: "#F8EDED",
    padding: 32,
  },
  // Large page header/title
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
    marginBottom: 48,
  },
  // Card for each contact in the list
  contactCard: {
    backgroundColor: "#F6D4D7",
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  // Contact name styling
  name: {
    fontSize: 18,
    fontWeight: "500",
  },
  // Contact phone number styling
  phone: {
    fontSize: 16,
    color: "#555",
  },
  // Add new contact button container
  addButton: {
    marginTop: 16,
    backgroundColor: "#E37B80",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  // Text inside the add button
  addButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});
