import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { Picker } from "@react-native-picker/picker";
import * as Location from "expo-location";
import {
  EmailAuthProvider,
  getAuth,
  reauthenticateWithCredential,
  updateEmail,
} from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Button,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { db } from "../../firebase/config";

export default function ProfileScreen() {
  //  Firebase Authentication & Current User Info
  const auth = getAuth();
  const user = auth.currentUser;
  const uid = user?.uid;

  //  State Variables for Profile Fields
  const [name, setName] = useState("");
  const [gender, setGender] = useState("");
  const [birthday, setBirthday] = useState<Date | null>(null);
  const [address, setAddress] = useState("");
  const [postal, setPostal] = useState("");
  const [maritalStatus, setMaritalStatus] = useState("");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState("");

  //  UI Control State
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [reauthenticating, setReauthenticating] = useState(false);

  //  Original Stored Values (to detect changes)
  const [originalEmail, setOriginalEmail] = useState(user?.email || "");
  const [originalPhone, setOriginalPhone] = useState("");

  //  Date Picker Handlers
  const showDatePicker = () => setDatePickerVisibility(true);
  const hideDatePicker = () => setDatePickerVisibility(false);
  const handleDateConfirm = (date: Date) => {
    setBirthday(date);
    hideDatePicker();
  };

  // State to store user's current location
  const [location, setLocation] = useState<Location.LocationObject | null>(
    null
  );

  // Error state in case location access fails
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // BottomSheet reference to control snap points
  const bottomSheetRef = useRef<BottomSheet>(null);
  // Defines the height levels of the bottom sheet
  const snapPoints = useMemo(() => ["15%", "65%", "95%"], []);

  // Automatically snap open the bottom sheet a second after screen load
  useEffect(() => {
    setTimeout(() => {
      bottomSheetRef.current?.snapToIndex(1);
    }, 1000);
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

  // Load Profile Data from Firestore on Component Mount
  useEffect(() => {
    const loadProfile = async () => {
      if (!uid) return; // Exit early if no user ID is available

      const docRef = doc(db, "users", uid); // Reference to the user's document in Firestore
      const docSnap = await getDoc(docRef); // Fetch the document snapshot

      if (docSnap.exists()) {
        // If the document exists, populate profile state with its data
        const data = docSnap.data();
        setName(data.name || "");
        setGender(data.gender || "");
        setBirthday(data.birthday ? new Date(data.birthday) : null);
        setAddress(data.address || "");
        setPostal(data.postal || "");
        setMaritalStatus(data.maritalStatus || "");
        setEmail(data.email || "");
        setPhone(data.phone || "");
        setOriginalPhone(data.phone || "");
      }
    };

    loadProfile(); // Invoke the profile loading function
  }, [uid]); // Re-run when user ID changes

  // Input Validation for Email & Phone
  const validateFields = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[0-9]{10,15}$/;

    if (!emailRegex.test(email)) {
      // Check if email is invalid
      Alert.alert("Invalid Email", "Please enter a valid email address."); // Show email error alert
      return false;
    }

    if (!phoneRegex.test(phone)) {
      // Check if phone number is invalid
      Alert.alert("Invalid Phone", "Please enter a valid phone number."); // Show phone error alert
      return false;
    }

    return true; // All validations passed
  };

  // Reauthenticate User Before Sensitive Changes
  const reauthenticateUser = async (currentPassword: string) => {
    if (!user?.email) return false; // Exit if user email not available
    const credential = EmailAuthProvider.credential(
      user.email,
      currentPassword
    ); // Create credential with current email and password

    try {
      await reauthenticateWithCredential(user, credential); // Reauthenticate user with credential
      return true; // Return success
    } catch (error: any) {
      Alert.alert("Re-authentication failed", error.message); // Show error alert on failure
      return false; // Return failure
    }
  };

  // Handle Password Submission for Re-authentication
  const onSubmitPassword = async () => {
    if (!passwordInput) {
      Alert.alert("Error", "Please enter your current password."); // Alert if password is empty
      return; // Exit early
    }

    setReauthenticating(true); // Start loading state
    const success = await reauthenticateUser(passwordInput); // Attempt reauthentication
    setReauthenticating(false); // End loading state

    if (success) {
      setPasswordModalVisible(false); // Close password modal
      saveProfileAfterReauth(); // Proceed to save profile
    }
  };

  //  Save Profile Changes After Email Re-authentication
  const saveProfileAfterReauth = async () => {
    try {
      if (!user) {
        Alert.alert("Error", "User not logged in.");
        return;
      }

      // Update email in Firebase Auth
      await updateEmail(user, email);
      setOriginalEmail(email);

      // If phone changed, trigger verification TODO: Implement SMS verification flow
      /* if (phone !== originalPhone) {
        Alert.alert(
          "Phone Number Change",
          "Please verify your new phone number via SMS in the dedicated verification flow."
        );
        setOriginalPhone(phone);
      } */

      // Save updated data to Firestore
      const docRef = doc(db, "users", uid!);
      await setDoc(
        docRef,
        {
          name,
          gender,
          birthday: birthday?.toISOString() || "",
          address,
          postal,
          maritalStatus,
          email,
          phone,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );

      Alert.alert("Success", "Profile updated successfully.");
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to update profile.");
    }
  };

  //  Save Profile Changes (with conditional email re-authentication)
  const saveProfile = async () => {
    if (!uid || !validateFields()) return;

    // If email changed, re-authentication required
    if (email !== originalEmail) {
      setPasswordModalVisible(true);
    } else {
      try {
        if (phone !== originalPhone) {
          Alert.alert(
            "Phone Number Change",
            "Please verify your new phone number via SMS in the dedicated verification flow."
          );
          setOriginalPhone(phone);
        }

        // Save updated data to Firestore
        const docRef = doc(db, "users", uid);
        await setDoc(
          docRef,
          {
            name,
            gender,
            birthday: birthday?.toISOString() || "",
            address,
            postal,
            maritalStatus,
            email,
            phone,
            updatedAt: serverTimestamp(),
          },
          { merge: true }
        );

        Alert.alert("Success", "Profile updated successfully.");
      } catch (error: any) {
        Alert.alert("Error", error.message || "Failed to update profile.");
      }
    }
  };

  // Format date with suffix for display
  function formatDateWithSuffix(date: Date) {
    const day = date.getDate();
    const year = date.getFullYear();

    // Month names array
    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    // Determine the day suffix
    let suffix = "th";
    if (day === 1 || day === 21 || day === 31) suffix = "st";
    else if (day === 2 || day === 22) suffix = "nd";
    else if (day === 3 || day === 23) suffix = "rd";

    return `${monthNames[date.getMonth()]} ${day}${suffix}, ${year}`;
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={{ flex: 1, minHeight: 200 }}>
        <ScrollView contentContainerStyle={styles.container}>
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
        </ScrollView>
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
            {/* Name Field */}
            <View style={styles.row}>
              <Text style={styles.label}>{"Name"}</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
              />
            </View>

            {/* Email Field */}
            <View style={styles.row}>
              <Text style={styles.label}>{"Email Address"}</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            {/* Phone Number Field */}
            <View style={styles.row}>
              <Text style={styles.label}>{"Phone Number"}</Text>
              <TextInput
                style={styles.input}
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
              />
            </View>

            {/* Address Field */}
            <View style={styles.row}>
              <Text style={styles.label}>{"Address"}</Text>
              <TextInput
                style={styles.input}
                value={address}
                onChangeText={setAddress}
              />
            </View>

            {/* Postal Field */}
            <View style={styles.row}>
              <Text style={styles.label}>{"Postal Code"}</Text>
              <TextInput
                style={styles.input}
                value={postal}
                onChangeText={setPostal}
              />
            </View>

            {/* Birthday Picker */}
            <View style={styles.row}>
              <Text style={styles.label}>{"Birthday"}</Text>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={showDatePicker}
              >
                <Text style={styles.dateButtonText}>
                  {birthday
                    ? formatDateWithSuffix(birthday)
                    : "Select Birthday"}
                </Text>
              </TouchableOpacity>
            </View>

            <DateTimePickerModal
              isVisible={isDatePickerVisible}
              mode="date"
              onConfirm={handleDateConfirm}
              onCancel={hideDatePicker}
              maximumDate={new Date()}
            />

            {/* Gender Selection */}
            <View style={styles.row}>
              <Text style={[styles.label, { marginTop: -2 }]}>{"Gender"}</Text>
              <Picker
                selectedValue={gender}
                onValueChange={(itemValue) => setGender(itemValue)}
                style={styles.picker}
              >
                <Picker.Item label="Select Gender" value="" />
                <Picker.Item label="Male" value="male" />
                <Picker.Item label="Female" value="female" />
                <Picker.Item label="Non-Binary/Other" value="other" />
              </Picker>
            </View>

            {/* Marital Status Picker */}
            <View style={styles.row}>
              <Text style={[styles.label, { marginTop: -2 }]}>
                {"Marital Status"}
              </Text>
              <Picker
                selectedValue={maritalStatus}
                onValueChange={(itemValue) => setMaritalStatus(itemValue)}
                style={styles.picker}
              >
                <Picker.Item label="Select Marital Status" value="" />
                <Picker.Item label="Single" value="single" />
                <Picker.Item label="Married" value="married" />
                <Picker.Item label="Divorced" value="divorced" />
                <Picker.Item label="Widowed" value="widowed" />
              </Picker>
            </View>

            {/* Save Button */}
            <TouchableOpacity style={styles.saveButton} onPress={saveProfile}>
              <Text style={styles.saveButtonText}>{"Save Changes"}</Text>
            </TouchableOpacity>

            {/* Password Modal for Email Change */}
            <Modal
              animationType="slide"
              transparent={true}
              visible={passwordModalVisible}
              onRequestClose={() => setPasswordModalVisible(false)}
            >
              <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                  <Text style={styles.modalTitle}>{"Re-enter Password"}</Text>
                  <Text style={{ marginBottom: 12 }}>
                    {
                      "For security, please enter your current password to change your email address."
                    }
                  </Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Current Password"
                    secureTextEntry
                    value={passwordInput}
                    onChangeText={setPasswordInput}
                    autoCapitalize="none"
                  />
                  {reauthenticating ? (
                    <ActivityIndicator
                      size="small"
                      style={{ marginVertical: 10 }}
                    />
                  ) : (
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "flex-end",
                      }}
                    >
                      <Button
                        title="Cancel"
                        onPress={() => {
                          setPasswordModalVisible(false);
                          setPasswordInput("");
                        }}
                      />
                      <View style={{ width: 12 }} />
                      <Button title="Submit" onPress={onSubmitPassword} />
                    </View>
                  )}
                </View>
              </View>
            </Modal>
          </BottomSheetView>
        </BottomSheet>
      </View>
    </KeyboardAvoidingView>
  );
}

// Styles for Profile Screen
const styles = StyleSheet.create({
  // Container style for overall padding of the screen
  container: {
    flex: 1,
    position: "relative",
  },

  // Styles for bottom sheet content area with padding and rounded corners
  sheetContent: {
    flex: 1,
    padding: 25,
    backgroundColor: "#F6D4D7",
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    height: "100%",
  },

  // Style for the drag handle indicator
  handleIndicator: {
    backgroundColor: "#85484b4d",
    width: 80,
    height: 6,
    alignSelf: "center",
    marginTop: 10,
  },

  // Row style for input fields
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#85484b4d",
  },

  // Label text styling with bold font and top margin
  label: {
    fontSize: 14,
    flex: 1,
    color: "#85484bff",
  },

  // TextInput styling
  input: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    flex: 1,
    textAlign: "right",
  },

  // Style for the map component
  map: {
    flex: 1,
    backgroundColor: "transparent",
  },

  // Container for map
  mapContainer: {
    flex: 1,
    height: "100%",
    overflow: "hidden",
    backgroundColor: "white",
  },

  // Picker dropdown styling
  picker: {
    flex: 1,
    height: 55,
    width: "20%",
    marginTop: -12,
    marginBottom: -8,
  },

  // TouchableOpacity style for birthday selection button
  dateButton: {
    alignItems: "flex-start",
    paddingHorizontal: 12,
    marginTop: 6,
    marginBottom: 6,
  },

  // Text style inside the date button
  dateButtonText: {
    color: "#000",
    fontSize: 14,
  },

  // Save button style with background color, padding, and rounded corners
  saveButton: {
    backgroundColor: "#E37B80",
    width: "80%",
    paddingVertical: 12,
    borderRadius: 8,
    alignSelf: "center",
    alignItems: "center",
    marginVertical: 20,
  },

  // Text style inside the save button
  saveButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },

  // Modal overlay with semi-transparent black background centered content
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },

  // Modal content container with white background, padding, and rounded corners
  modalContent: {
    width: "90%",
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
  },

  // Title text styling inside the modal with bold font and margin below
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
  },
});
