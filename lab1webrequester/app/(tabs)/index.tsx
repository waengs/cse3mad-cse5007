import React, { useState } from 'react';
import { View, StyleSheet, Button, TextInput, Text } from 'react-native';

export default function HomeScreen() {
  const [text, setText] = useState('https://reactnative.dev/movies.json');
  const [webData, setWebData] = useState('');

  const handlePressButtonAsync = async () => {
    try {
      const response = await fetch(text);

      if (!response.ok) {
        throw new Error(`${response.status} ${response.statusText}`);
      }

      const data = await response.text(); // or response.json()
      console.log('success:', data);

      setWebData(
        `Status: ${response.status} ${response.statusText}\n\n${data}`
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.warn('error:', message);
      setWebData(`Error: ${message}`);
    }
  };

  return (
    <View style={styles.containerColumn}>
      <View style={styles.containerRow}>
        <TextInput
          style={styles.input}
          onChangeText={setText}
          value={text}
        />
        <Button title="Go Request" onPress={handlePressButtonAsync} />
      </View>

      <Text>{webData}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  containerColumn: {
    flexDirection: 'column',
    padding: 40,
    backgroundColor: '#ffffff', // dark background
  },
  containerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    color: '#fff',            // 👈 text color
    backgroundColor: '#222',  // 👈 input background
    borderWidth: 1,
    borderColor: '#555',
    padding: 8,
    marginRight: 10,
  },
});

