// _layout.tsx
import * as Location from "expo-location";
import { Stack } from "expo-router";
import MapView, { Marker } from "react-native-maps";

import React, {
  useEffect,
  useState
} from "react";

import BottomBar from "@/components/BottomBar";
import ContactsButton from "../../assets/images/contactsTopNavButton.svg";
import SettingsButton from "../../assets/images/settingsTopNavButton.svg";

import {
  ActivityIndicator,
  Dimensions,
  StyleSheet,
  View
} from "react-native";


export default function HomeLayout() {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const { width, height } = Dimensions.get("window");
  const userName = "You";

  // Request location on mount
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return;
      
      const currentLocation = await Location.getCurrentPositionAsync({});
    })();
  }, []);

  return (
    <View style={{ flex: 1}}>
      {/* Full-screen map */}
      {location ? (
        <MapView style={{ width, height, position: "relative", top: 0, left: 0 }}
          initialRegion={{
            latitude: location!.coords.latitude,
            longitude: location!.coords.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
          showsUserLocation
        >
          <Marker
            coordinate={{
              latitude: location!.coords.latitude,
              longitude: location!.coords.longitude,
            }}
            title={`You are here${userName ? `, ${userName}` : ""}`}
          />
        </MapView>) : (
        <ActivityIndicator
          size="large"
          color="#0000ff"
        />
      )}

      <View style={styles.topContainer}>
        <SettingsButton />
        <ContactsButton />
      </View>

      <View style={styles.barContainer}>
        <BottomBar onPressLocation={function (): void {
          throw new Error("Function not implemented.");
        } } onPressSOS={function (): void {
          throw new Error("Function not implemented.");
        } } onPressAccount={function (): void {
          throw new Error("Function not implemented.");
        } } />
        {/* Temporary until linked to Modals */}
        
      </View>
    
      
      {/* Stack for screen renders on top of map */}
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: "transparent", paddingTop: 0 },
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  barContainer: {
    position: 'absolute',
    flexDirection: 'row',
    width: '100%',
    height: 120,
    bottom: -60,
    borderRadius: 80,
    backgroundColor: '#fff',
  },

  topContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignContent: 'center',
    position: 'absolute',
    gap: '50%',
    width: '100%',
    height: 100,
    top: 25,
  }
});
