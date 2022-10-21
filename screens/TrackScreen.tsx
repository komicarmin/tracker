import React from 'react';
import { StyleSheet, View } from 'react-native';
import NewRecord from '../components/NewRecord';

export default function TrackScreen() {
  return (
    <View style={styles.container}>
      <NewRecord />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
