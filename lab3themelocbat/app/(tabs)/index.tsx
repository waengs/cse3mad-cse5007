// app/tabs/index.tsx

import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
  Button,
  Platform,
} from 'react-native';
import { Link } from 'expo-router';

import type { Theme } from '../../components/ThemeContext';
import {
  blueTheme,
  darkTheme,
  lightTheme,
  yellowTheme,
} from '../../components/ThemeContext';

const themes: Theme[] = [lightTheme, darkTheme, blueTheme, yellowTheme];

export default function ThemedApp() {
  const systemScheme = useColorScheme();
  const [themeIndex, setThemeIndex] = useState<number>(0);
  const [theme, setTheme] = useState<Theme>(lightTheme);

  // Battery — expo-battery hooks crash on web (addListener not supported).
  // Use local state and only populate it on native platforms.
  const [batteryLevel, setBatteryLevel] = useState<number | null>(null);
  const [batteryState, setBatteryState] = useState<number | null>(null);

  useEffect(() => {
    if (Platform.OS === 'web') return; // skip on web

    let levelSub: { remove: () => void } | null = null;
    let stateSub: { remove: () => void } | null = null;

    (async () => {
      const Battery = await import('expo-battery');

      // Read initial values
      setBatteryLevel(await Battery.getBatteryLevelAsync());
      setBatteryState(await Battery.getBatteryStateAsync());

      // Subscribe to changes
      levelSub = Battery.addBatteryLevelListener(({ batteryLevel: lvl }) => {
        setBatteryLevel(lvl);
      });
      stateSub = Battery.addBatteryStateListener(({ batteryState: st }) => {
        setBatteryState(st);
      });
    })();

    return () => {
      levelSub?.remove();
      stateSub?.remove();
    };
  }, []);

  useEffect(() => {
    if (systemScheme === 'dark') {
      setTheme(darkTheme);
      setThemeIndex(1);
    } else {
      setTheme(lightTheme);
      setThemeIndex(0);
    }
  }, [systemScheme]);

  const cycleTheme = () => {
    const nextIndex = (themeIndex + 1) % themes.length;
    setTheme(themes[nextIndex]);
    setThemeIndex(nextIndex);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text style={[styles.text, { color: theme.colors.text }]}>
        Current theme: {theme.mode}
      </Text>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: theme.customColors.buttonBackground }]}
        onPress={cycleTheme}
      >
        <Text style={{ color: theme.customColors.buttonText }}>
          Switch Theme
        </Text>
      </TouchableOpacity>

      {/* Battery Section */}
      <View style={{ marginTop: 20 }}>
        <Text style={{ color: theme.colors.text }}>
          Battery Level:{' '}
          {Platform.OS === 'web'
            ? 'N/A on web'
            : batteryLevel !== null
              ? `${Math.round(batteryLevel * 100)}%`
              : 'Loading...'}
        </Text>

        <Text style={{ color: theme.colors.text }}>
          Battery State:{' '}
          {Platform.OS === 'web' ? 'N/A on web' : batteryState ?? 'Unknown'}
        </Text>
      </View>

      {/* Navigation */}
      <View style={{ marginTop: 20 }}>
        <Link href="./locPermissionsButton" asChild>
          <Button title="Location" />
        </Link>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  text: {
    fontSize: 20,
    marginBottom: 16,
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
});