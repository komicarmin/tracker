import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { MD3LightTheme as DefaultTheme, Provider as PaperProvider } from 'react-native-paper';

import useCachedResources from './hooks/useCachedResources';
import useColorScheme from './hooks/useColorScheme';
import Navigation from './navigation';

export default function App() {
  const isLoadingComplete = useCachedResources();
  const colorScheme = useColorScheme();

  const theme = {
    ...DefaultTheme,
    roundness: 5,
    version: 3,
    colors: {
      ...DefaultTheme.colors,
      primary: '#0060a8',
      secondary: '#545f70',
      tertiary: '#6c5677',
    },
  };

  if (!isLoadingComplete) {
    return null;
  } else {
    return (
      <PaperProvider theme={theme}>
        <SafeAreaProvider>
          <Navigation colorScheme={colorScheme} />
          <StatusBar />
        </SafeAreaProvider>
      </PaperProvider>
    );
  }
}
