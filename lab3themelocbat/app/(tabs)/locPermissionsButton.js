//app/locPermissionsButton.js
import React from 'react';
import { Button, View, StyleSheet, Platform, Alert, Text } from 'react-native';

const LOCATION_TASK_NAME = 'background-location-task';

const requestPermissions = async () => {
  // Background location + TaskManager are native-only — not supported on web.
  if (Platform.OS === 'web') {
    Alert.alert('Not supported', 'Background location is not available on web.');
    return;
  }

  // Dynamically import native-only modules so they don't crash on web
  const Location = await import('expo-location');
  const TaskManager = await import('expo-task-manager');

  // Define the background task (safe to call multiple times)
  if (!TaskManager.isTaskDefined(LOCATION_TASK_NAME)) {
    TaskManager.defineTask(LOCATION_TASK_NAME, ({ data, error }) => {
      alert('start task manager..');
      if (error) {
        return;
      }
      if (data) {
        const { locations } = data;
        const lat = locations[0].coords.latitude;
        const long = locations[0].coords.longitude;
        const speed = locations[0].coords.speed;
        const heading = locations[0].coords.heading;
        const accuracy = locations[0].coords.accuracy;

        alert(
          `${new Date(Date.now()).toLocaleString()}: ${lat},${long} - Speed ${speed} - Precision ${accuracy} - Heading ${heading} `
        );
      }
    });
  }

  const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
  if (foregroundStatus === 'granted') {
    const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
    if (backgroundStatus === 'granted') {
      await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
        accuracy: Location.Accuracy.Balanced,
      });
    }
  }
};

const locPermissionsButton = () => (
  <View style={styles.container}>
    <Button onPress={requestPermissions} title="Enable background location" />
    {Platform.OS === 'web' && (
      <Text style={styles.webNote}>Not available on web</Text>
    )}
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  webNote: {
    marginTop: 8,
    color: 'gray',
    fontSize: 12,
    fontStyle: 'italic',
  },
});

export default locPermissionsButton;