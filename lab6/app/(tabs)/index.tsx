import React, { useRef, useState } from "react";
import {
  Alert,
  Button,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import MapView, {
  Circle,
  Marker,
  Polygon,
  Polyline,
  PROVIDER_GOOGLE,
} from "react-native-maps";
import * as Location from "expo-location";

export default function App() {
  // ── Geocoding state ─────────────────────────────────────────────────────────
  const [addressInput, setAddressInput] = useState<string>(
    "La Trobe University, Bundoora VIC 3086"
  );
  const [coords, setCoords] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [addressOutput, setAddressOutput] = useState<string>("");

  const mapRef = useRef<MapView>(null);

  const geocodeAddress = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission required", "Location permission is needed");
      return;
    }
    try {
      const results = await Location.geocodeAsync(addressInput);
      if (results.length > 0) {
        const { latitude, longitude } = results[0];
        setCoords({ latitude, longitude });
        setAddressOutput("");
        // Animate map to the geocoded location
        mapRef.current?.animateToRegion(
          { latitude, longitude, latitudeDelta: 0.01, longitudeDelta: 0.01 },
          800
        );
      } else {
        Alert.alert("No results", "Could not find that address.");
      }
    } catch (e) {
      console.error(e);
      Alert.alert("Error", "Failed to geocode");
    }
  };

  const reverseGeocode = async () => {
    if (!coords) {
      Alert.alert("No coords", "Please geocode an address first.");
      return;
    }
    try {
      const results = await Location.reverseGeocodeAsync(coords);
      if (results.length > 0) {
        const res = results[0];
        setAddressOutput(
          `${res.name ?? ""} ${res.street ?? ""}, ${res.city ?? ""} ${res.region ?? ""}, ${res.country ?? ""}`
        );
      }
    } catch (e) {
      console.error(e);
      Alert.alert("Error", "Failed to reverse geocode");
    }
  };

  // ── Static map data ─────────────────────────────────────────────────────────
  const markers = [
    {
      coordinate: { latitude: -37.721077, longitude: 145.047977 },
      title: "Agora",
      description: "My Coffee",
    },
    {
      coordinate: { latitude: -37.721407, longitude: 145.04653 },
      title: "Beth Gleeson Building",
      description: "My Home away from home",
    },
    {
      coordinate: { latitude: -37.7198, longitude: 145.0493 },
      title: "Library",
      description: "Study spot",
    },
  ];

  const routeToUni = [
    { latitude: -37.7155, longitude: 145.0412 },
    { latitude: -37.7165, longitude: 145.0425 },
    { latitude: -37.7178, longitude: 145.0441 },
    { latitude: -37.7191, longitude: 145.0458 },
    { latitude: -37.7205, longitude: 145.0468 },
    { latitude: -37.721407, longitude: 145.04653 },
  ];

  const weeklyPlaces = [
    { latitude: -37.721077, longitude: 145.047977 },
    { latitude: -37.7198, longitude: 145.0493 },
    { latitude: -37.7212, longitude: 145.0485 },
    { latitude: -37.721407, longitude: 145.04653 },
    { latitude: -37.72, longitude: 145.0452 },
  ];

  return (
    <View style={styles.container}>
      {/* ── Geocoding panel ── */}
      <View style={styles.panel}>
        <Text style={styles.title}>Geocoding Demo</Text>
        <TextInput
          style={styles.input}
          value={addressInput}
          onChangeText={setAddressInput}
          placeholder="Enter an address…"
        />
        <Button title="Geocode Address" onPress={geocodeAddress} />
        {coords && (
          <Text style={styles.info}>
            📍 {coords.latitude.toFixed(6)}, {coords.longitude.toFixed(6)}
          </Text>
        )}
        <Button
          title="Reverse Geocode"
          onPress={reverseGeocode}
          disabled={!coords}
        />
        {!!addressOutput && (
          <Text style={styles.info}>🏠 {addressOutput}</Text>
        )}
      </View>

      {/* ── Map ── */}
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={{
          latitude: -37.719,
          longitude: 145.046,
          latitudeDelta: 0.015,
          longitudeDelta: 0.015,
        }}
      >
        {/* Campus markers */}
        {markers.map((marker, index) => (
          <Marker
            key={index}
            coordinate={marker.coordinate}
            title={marker.title}
            description={marker.description}
          />
        ))}

        {/* Geocoded location marker */}
        {coords && (
          <Marker
            coordinate={coords}
            title="Geocoded Location"
            description={addressInput}
            pinColor="blue"
          />
        )}

        {/* Route to university (blue dashed line) */}
        <Polyline
          coordinates={routeToUni}
          strokeColor="#1565C0"
          strokeWidth={4}
          lineDashPattern={[10, 5]}
        />

        {/* Weekly places polygon (green filled area) */}
        <Polygon
          coordinates={weeklyPlaces}
          strokeColor="#2E7D32"
          fillColor="rgba(76, 175, 80, 0.25)"
          strokeWidth={3}
        />

        {/* Circle around Beth Gleeson Building */}
        <Circle
          center={{ latitude: -37.721407, longitude: 145.04653 }}
          radius={200}
          strokeColor="#E65100"
          fillColor="rgba(255, 152, 0, 0.2)"
          strokeWidth={2}
        />
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  panel: {
    paddingTop: Platform.OS === "android" ? 50 : 60,
    paddingHorizontal: 20,
    paddingBottom: 12,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 12,
  },
  input: {
    borderColor: "#888",
    borderWidth: 1,
    padding: 8,
    marginBottom: 12,
    borderRadius: 4,
  },
  info: {
    marginTop: 10,
    marginBottom: 10,
    fontSize: 14,
  },
  map: {
    flex: 1,
  },
});