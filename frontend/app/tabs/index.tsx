import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Pressable, Dimensions } from "react-native";
import MapView, { Marker, MapPressEvent } from "react-native-maps";
import * as Location from "expo-location";
import axios from "axios";

const BACKEND_URL = "https://backend-adwr.onrender.com";
const { width } = Dimensions.get("window");

type Coords = {
  latitude: number;
  longitude: number;
};

export default function MapPage() {
  const [carLocation, setCarLocation] = useState<Coords | null>(null);
  const [carAddress, setCarAddress] = useState<string>(
    "No parking location saved yet",
  );
  const [selecting, setSelecting] = useState(false);
  const [tempLocation, setTempLocation] = useState<Coords | null>(null);

  useEffect(() => {
    Location.requestForegroundPermissionsAsync();
    fetchSavedLocation();
  }, []);

  const fetchSavedLocation = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/car-location`);
      if (res.data.latitude && res.data.longitude) {
        const { latitude, longitude } = res.data;
        setCarLocation({ latitude, longitude });

        const [place] = await Location.reverseGeocodeAsync({
          latitude,
          longitude,
        });
        setCarAddress(`${place.street || ""} ${place.city || ""}`.trim());
      }
    } catch (err) {
      console.log(err);
      setCarAddress("Backend not reachable");
    }
  };

  const startSelectingLocation = () => {
    setTempLocation(carLocation || { latitude: 0, longitude: 0 });
    setSelecting(true);
  };

  const confirmLocation = async () => {
    if (!tempLocation) return;
    const { latitude, longitude } = tempLocation;

    try {
      await axios.post(`${BACKEND_URL}/car-location`, { latitude, longitude });
      setCarLocation({ latitude, longitude });

      const [place] = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });
      setCarAddress(`${place.street || ""} ${place.city || ""}`.trim());

      setSelecting(false);
    } catch (err) {
      console.log(err);
      setCarAddress("Failed to save location");
    }
  };

  return (
    <View style={styles.container}>
      {selecting && tempLocation ? (
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: tempLocation.latitude,
            longitude: tempLocation.longitude,
            latitudeDelta: 0.005,
            longitudeDelta: 0.005,
          }}
          onPress={(e: MapPressEvent) =>
            setTempLocation(e.nativeEvent.coordinate)
          }
        >
          <Marker coordinate={tempLocation} title="New Location" />
        </MapView>
      ) : null}

      {!selecting && (
        <View style={styles.centerBox}>
          <Text style={styles.addressText}>Current Location:</Text>
          <Text style={styles.address}>{carAddress}</Text>

          <Pressable style={styles.button} onPress={startSelectingLocation}>
            <Text style={styles.buttonText}>Update Location</Text>
          </Pressable>
        </View>
      )}

      {selecting && (
        <View style={styles.confirmButtonContainer}>
          <Pressable style={styles.button} onPress={confirmLocation}>
            <Text style={styles.buttonText}>Confirm Location</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  centerBox: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  addressText: { fontWeight: "bold", marginBottom: 8, fontSize: 16 },
  address: { marginBottom: 20, textAlign: "center" },
  button: {
    backgroundColor: "#617b9899",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  buttonText: { color: "white", fontWeight: "bold" },
  confirmButtonContainer: {
    position: "absolute",
    bottom: 40,
    width: width,
    alignItems: "center",
  },
});
