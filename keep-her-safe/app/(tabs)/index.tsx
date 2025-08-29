import "react-native-reanimated";
import React, { useEffect, useState, useRef, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Dimensions,
  TouchableOpacity,
  ScrollView,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  LogBox,
} from "react-native";
import { auth, db } from "../../firebase/config";
import { useRouter } from "expo-router";
import * as Location from "expo-location";
import MapView, { Marker } from "react-native-maps";
import { Ionicons } from "@expo/vector-icons";
import * as SMS from "expo-sms";
import { getAuth } from "firebase/auth";
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  getDoc,
} from "firebase/firestore";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";

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
  // BottomSheet reference to control snap points
  const bottomSheetRef = useRef<BottomSheet>(null);
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

  // Load emergency contact list from Firestore for the current user
  useEffect(() => {
    const fetchContacts = async () => {
      const auth = getAuth();
      const db = getFirestore();
      const user = auth.currentUser;

      if (!user) return; // Exit if no user is logged in

      try {
        const contactsRef = collection(db, "users", user.uid, "contacts");
        const snapshot = await getDocs(contactsRef); // Fetch contacts subcollection

        const contactsData = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            name: data.name,
            number: data.phoneNumber,
          };
        });

        setContacts(contactsData); // Store the retrieved contacts
      } catch (error) {
        console.error("Error fetching contacts:", error); // Log errors if fetch fails
      }
    };

    fetchContacts();
  }, []);

  // Automatically snap open the bottom sheet a second after screen load
  useEffect(() => {
    setTimeout(() => {
      bottomSheetRef.current?.snapToIndex(0);
    }, 1000);
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
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={{ flex: 1, minHeight: 200 }}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.container}>
            {/* User welcome section */}
            <View style={styles.shadowWrapper}>
              <View style={styles.userHeaderContainer}>
                {/* Display welcome message with user's name or fallback */}
                <Text style={styles.userNameText}>
                  {"Welcome,"} {userName || "User"}!
                </Text>
                {/* User avatar placeholder */}
                <View style={styles.userImagePlaceholder}>
                  <Text
                    style={{ color: "#fff", fontWeight: "bold", fontSize: 18 }}
                  >
                    {"👤"}
                  </Text>
                </View>
              </View>
            </View>

            {/* Map section showing user location */}
            {!location ? (
              // Show loading spinner while location is being fetched
              <ActivityIndicator
                size="large"
                color="#0000ff"
                style={{ marginVertical: 20 }}
              />
            ) : (
              // Display map centered on user's current location
              <View style={styles.mapContainer}>
                <MapView
                  style={styles.map}
                  region={{
                    latitude: location.coords.latitude,
                    longitude: location.coords.longitude,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                  }}
                  showsUserLocation={true} // Highlight user's location on map
                >
                  <Marker
                    coordinate={{
                      latitude: location.coords.latitude,
                      longitude: location.coords.longitude,
                    }}
                    title="You are here" // Marker label for user location
                  />
                </MapView>
              </View>
            )}

            {/* SOS and additional controls */}
            <View style={styles.buttonWrapper}>
              <View style={styles.buttonContainer}>
                <View style={styles.buttonRow}>
                  <TouchableOpacity
                    style={styles.sosButton}
                    onPress={handleSOSPress} // Trigger emergency SMS sending when pressed
                  >
                    <Text style={styles.sosText}>{"SOS"}</Text>
                  </TouchableOpacity>

                  <View style={styles.rightButtonColumn}>
                    <TouchableOpacity
                      style={styles.secondaryButton}
                      onPress={() => Alert.alert("Second Button Pressed")} // Placeholder action for second button
                    >
                      <Text style={styles.secondaryButtonText}>
                        {"ACTIVATED "}
                      </Text>
                      <Ionicons name="alert-circle" size={24} color="#E37B80" />
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.secondaryButton}
                      onPress={() => Alert.alert("Third Button Pressed")} // Placeholder action for location sharing button
                    >
                      <Text style={styles.secondaryButtonText}>
                        {"LOCATION SHARING"}
                      </Text>
                      <Ionicons name="location" size={24} color="#E37B80" />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Emergency Contacts Bottom Sheet */}
        <BottomSheet
          ref={bottomSheetRef} // Reference to control the bottom sheet programmatically
          index={-1} // Initial index, -1 means hidden on mount
          snapPoints={snapPoints} // Define the snap points for sheet expansion
          enablePanDownToClose={false} // Disable closing sheet by dragging down
          backgroundStyle={{
            backgroundColor: "#F6D4D7",
            borderTopLeftRadius: 40,
            borderTopRightRadius: 40,
          }}
          handleIndicatorStyle={styles.handleIndicator} // Style for the drag handle indicator
        >
          <BottomSheetView style={styles.sheetContent}>
            <Text style={styles.contactsHeader}>{"Emergency Contacts"}</Text>
            {contacts.length === 0 ? (
              // Show message when no contacts are available
              <Text style={{ color: "gray" }}>{"No contacts found."}</Text>
            ) : (
              // Display list of emergency contacts using FlatList for performance
              <FlatList
                data={contacts}
                keyExtractor={(item, index) => index.toString()} // Unique key for each item
                renderItem={({ item }) => (
                  <View style={styles.contactItem}>
                    <Text style={styles.contactName}>{item.name}</Text>{" "}
                    <Text style={styles.contactNumber}>{item.number}</Text>
                  </View>
                )}
              />
            )}
          </BottomSheetView>
        </BottomSheet>
      </View>
    </KeyboardAvoidingView>
  );
}

// Style definitions below
const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    paddingBottom: 32,
  }, // Container style for ScrollView content layout and padding

  container: {
    width: "100%",
    padding: 16,
    paddingTop: 40,
    backgroundColor: "#F8EDED",
    alignItems: "center",
  }, // Main container style for page content with padding and background

  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 12,
  }, // Style for titles with bold font and spacing below

  // Styles for bottom sheet content area with padding and rounded corners
  sheetContent: {
    flex: 1,
    padding: 25,
    backgroundColor: "#F6D4D7",
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    height: "100%",
  },

  subtitle: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
  }, // Subtitle text style, centered with margin below

  userHeaderWrapper: {
    width: Dimensions.get("window").width - 32,
    borderRadius: 12,
    backgroundColor: "#fff",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    marginBottom: 20,
  }, // Wrapper style for user header with shadow and rounded corners

  shadowWrapper: {
    width: Dimensions.get("window").width - 32,
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    backgroundColor: "transparent",
    marginBottom: 20,
  }, // Wrapper providing stronger shadow effect with transparent background

  userHeaderContainer: {
    width: Dimensions.get("window").width - 32,
    padding: 16,
    borderRadius: 12,
    backgroundColor: "#F6D4D7",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#F6D4D7",
    elevation: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.7,
    shadowRadius: 15,
  }, // Container for user header content with padding, color, shadow, and layout

  userNameText: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#3B4B58",
  }, // Styling for the user name text, bold and colored

  userImagePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#F0B4B4",
    justifyContent: "center",
    alignItems: "center",
  }, // Circular placeholder style for user avatar

  map: {
    width: Dimensions.get("window").width - 32,
    height: 300,
    borderRadius: 12,
    marginBottom: 20,
    backgroundColor: "transparent",
  }, // Style for the map component with fixed size and rounded corners

  mapContainer: {
    width: Dimensions.get("window").width - 32,
    height: 300,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "white",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: "#D48D8D",
  }, // Container for map with shadow, border, rounded corners, and clipping overflow

  buttonWrapper: {
    width: "100%",
    borderRadius: 24,
    backgroundColor: "transparent",
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    marginVertical: 16,
  }, // Wrapper for buttons area with shadow and rounded edges

  buttonContainer: {
    width: "100%",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#F6D4D7",
    borderRadius: 20,
    overflow: "hidden",
  }, // Container for buttons with padding, background color, and rounded corners

  buttonRow: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    gap: 16,
    flexWrap: "nowrap",
  }, // Row layout for buttons aligned horizontally with spacing

  sosButton: {
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: "#E37B80",
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    flexShrink: 0,
  }, // Large round SOS button styling with shadow and center alignment

  rightButtonColumn: {
    flexDirection: "column",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    flexShrink: 1,
    maxWidth: "100%",
  }, // Column layout for right side buttons stacked vertically with spacing

  secondaryButton: {
    backgroundColor: "#fff",
    width: 240,
    height: 50,
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 12,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    flexShrink: 1,
    maxWidth: "100%",
  }, // Styling for secondary rectangular buttons with shadow and horizontal content alignment

  sosText: {
    color: "#fff",
    fontSize: 48,
    fontWeight: "bold",
    flex: 1,
    textAlign: "center",
    textAlignVertical: "center",
    includeFontPadding: false,
  }, // Text style inside SOS button with large size, white color and centered alignment

  secondaryButtonText: {
    color: "#E37B80",
    fontSize: 16,
    fontWeight: "bold",
  }, // Text style for secondary buttons with color and bold font

  // Style for the drag handle indicator
  handleIndicator: {
    backgroundColor: "#85484b4d",
    width: 80,
    height: 6,
    alignSelf: "center",
    marginTop: 10,
  },

  contactsHeader: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#3B4B58",
    marginTop: -24,
    marginBottom: 16,
    textAlign: "center",
    textAlignVertical: "center",
  }, // Header text style for emergency contacts list, centered and bold

  contactItem: {
    marginBottom: 8,
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 8,
  }, // Style for individual contact items with padding and rounded background

  contactName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#E37B80",
  }, // Text style for contact names with bold font

  contactNumber: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#E37B80",
  }, // Text style for contact number
});
