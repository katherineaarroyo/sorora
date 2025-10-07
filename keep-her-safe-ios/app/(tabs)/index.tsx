import * as Location from "expo-location";
import { useRouter } from "expo-router";
import * as SMS from "expo-sms";
import {
  collection,
  doc,
  getDoc,
  getDocs
} from "firebase/firestore";
import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  LogBox,
  StyleSheet
} from "react-native";
import "react-native-reanimated";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { auth, db } from "../../firebase/config";

// Ignore all log notifications (Yellow Warning boxes)
LogBox.ignoreAllLogs(true);

// Hide red error screens for expo demo (Comment out to see errors during development)
console.error = () => {};

export default function HomeScreen() {
  const router = useRouter();
  // State to store user's current location
  const [location, setLocation] = useState<Location.LocationObject | null>(
    null
  );
  // Error state in case location access fails
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  // Emergency contacts list from Firestore
  const [contacts, setContacts] = useState<{ name: string; number: string }[]>(
    []
  );
  // User's display name
  const [userName, setUserName] = useState("");
  // Defines the height levels of the bottom sheet
  const snapPoints = useMemo(() => ["10%", "45%", "80%"], []);

  // Fetch the authenticated user's name from Firestore
  useEffect(() => {
    const fetchUserName = async () => {
      const authUser = auth.currentUser;
      if (!authUser) return; // Exit if user is not authenticated

      const userDocRef = doc(db, "users", authUser.uid);
      const userDocSnap = await getDoc(userDocRef);
      if (userDocSnap.exists()) {
        const data = userDocSnap.data();
        setUserName(data.name || "");
      } // Only update name if user document exists
    };

    fetchUserName(); // Run on component mount
  }, []);

  // Request location permission and get user's current location
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setErrorMsg("Permission to access location was denied"); // Store error message
        Alert.alert(
          "Location Permission Denied",
          "Please enable location access in settings."
        ); // Show alert if location access is denied
        return; // Exit early if permission not granted
      }

      const loc = await Location.getCurrentPositionAsync({});
      setLocation(loc); // Store user's current location
    })();
  }, []);

  // Handle pressing the SOS button: send location to all emergency contacts via SMS
  const handleSOSPress = async () => {
    try {
      if (!location) {
        Alert.alert("Error", "Location not available."); // Alert if location not yet retrieved
        return;
      }

      const userId = auth.currentUser?.uid;
      if (!userId) {
        Alert.alert("Error", "User not logged in."); // Alert if no authenticated user
        return;
      }

      // Fetch username info
      const userDoc = await getDoc(doc(db, "users", userId));
      const userName = userDoc.exists()
        ? userDoc.data().name || "A user"
        : "A user";

      // Fetch emergency contacts from Firestore
      const contactsRef = collection(db, "users", userId, "contacts");
      const snapshot = await getDocs(contactsRef);
      // Extract and filter valid phone numbers
      const phoneNumbers = snapshot.docs
        .map((doc) => doc.data().phoneNumber)
        .filter((number) => !!number);
      // Alert if no contacts found
      if (phoneNumbers.length === 0) {
        Alert.alert("No Contacts", "You have no emergency contacts.");
        return;
      }

      // Get location coordinates
      const { latitude, longitude } = location.coords;

      // Check if a custom alert message exists
      const customMessage = userDoc.exists()
        ? userDoc.data().customMessage
        : null;

      // If custom alert exists, use it and append location
      // Otherwise use default with user’s name
      const message = customMessage
        ? `${customMessage}\n\nLocation: https://maps.google.com/?q=${latitude},${longitude}`
        : `${userName} has sent you an SOS alert from Sorora!\n\nHere is their location: https://maps.google.com/?q=${latitude},${longitude}`;

      // Check if SMS is available
      const isAvailable = await SMS.isAvailableAsync();
      if (!isAvailable) {
        Alert.alert("Error", "SMS service is not available on this device."); // Alert if SMS not supported
        return;
      }

      // Send SMS to all emergency contacts
      const { result } = await SMS.sendSMSAsync(phoneNumbers, message);
      if (result === "sent") {
        Alert.alert("Success", "Emergency message sent."); // Confirm message sent
      } else {
        Alert.alert("Cancelled", "Message was not sent."); // Alert if user cancelled or failed
      }
    } catch (error) {
      console.error("SOS Error:", error);
      Alert.alert("Error", "Something went wrong while sending the alert."); // Catch-all error handler
    }
  };

  // Render the main screen UI including user welcome, map, and buttons
  return (
    <SafeAreaProvider>
    </SafeAreaProvider>
  );
}

// Style definitions below
const styles = StyleSheet.create({ 
});
