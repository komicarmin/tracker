import { ScrollView, StyleSheet } from 'react-native';

import Records from '../components/Records';

export default function HistoryScreen() {
  return (
    <ScrollView style={styles.container}>
      <Records />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "whitesmoke",
  },
});
