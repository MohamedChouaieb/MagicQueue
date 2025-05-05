import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { UserProvider } from './src/contexts/UserContext';
import { NetworkProvider } from './src/contexts/NetworkContext';
import { LogBox } from 'react-native';
import RootNavigator from './src/navigation/RootNavigator';

export default function App() {
  LogBox.ignoreAllLogs(); // Hide all warnings

  return (
    <UserProvider>
      <NavigationContainer>
        <NetworkProvider>
          <RootNavigator />
        </NetworkProvider>
      </NavigationContainer>
    </UserProvider>
  );
}
