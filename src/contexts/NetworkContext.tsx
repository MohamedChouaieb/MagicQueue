import React, { createContext, useState, useContext, ReactNode, useEffect, useRef } from 'react';
import { useNavigation, CommonActions } from '@react-navigation/native';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';

type NetworkContextType = {
  isConnected: boolean | null;
  checkConnection: () => Promise<boolean>;
};

const NetworkContext = createContext<NetworkContextType | undefined>(undefined);

export const NetworkProvider = ({ children }: { children: ReactNode }) => {
  const [isConnected, setIsConnected] = useState<boolean | null>(true);
  const navigation = useNavigation();
  const wasDisconnected = useRef<boolean>(false);
  const lastConnectionState = useRef<boolean | null>(true);

  // More reliable connection check that forces a new fetch from the device
  const checkConnection = async (): Promise<boolean> => {
    try {
      console.log("Checking network connection status...");
      // Force a new fetch instead of using cached info
      const state = await NetInfo.fetch();
      console.log("NetInfo result:", JSON.stringify(state));
      
      // Only update state if the connection state actually changed
      const newConnectionState = !!state.isConnected && state.isInternetReachable !== false;
      
      if (lastConnectionState.current !== newConnectionState) {
        console.log(`Connection state changed from ${lastConnectionState.current} to ${newConnectionState}`);
        lastConnectionState.current = newConnectionState;
        setIsConnected(newConnectionState);
      }
      
      return newConnectionState;
    } catch (error) {
      console.error("Failed to check connection:", error);
      setIsConnected(false);
      lastConnectionState.current = false;
      return false;
    }
  };

  // Function to handle connection state changes
  const handleConnectionChange = (state: NetInfoState) => {
    const newConnectionState = !!state.isConnected && state.isInternetReachable !== false;
    console.log(`Network change event: ${newConnectionState ? 'CONNECTED' : 'DISCONNECTED'}`);
    console.log(`Details: isConnected=${state.isConnected}, isInternetReachable=${state.isInternetReachable}`);
    
    // Only update if state really changed (prevents unnecessary rerenders)
    if (lastConnectionState.current !== newConnectionState) {
      console.log(`Connection state changed from ${lastConnectionState.current} to ${newConnectionState}`);
      lastConnectionState.current = newConnectionState;
      setIsConnected(newConnectionState);
      
      // Navigate to ConnectionError screen when connection is lost
      if (newConnectionState === false) {
        console.log("Connection lost, navigating to error screen");
        wasDisconnected.current = true;
        navigation.dispatch(
          CommonActions.navigate({
            name: 'Error',
            params: {
              screen: 'ConnectionError'
            }
          })
        );
      }
    }
  };

  useEffect(() => {
    // Initial check with a short delay to ensure the app is ready
    setTimeout(() => {
      checkConnection();
    }, 500);

    // Subscribe to network state updates
    const unsubscribe = NetInfo.addEventListener(handleConnectionChange);

    // Set up a regular polling of connection status (as a backup)
    const intervalId = setInterval(async () => {
      await checkConnection();
    }, 10000); // Every 10 seconds as a fallback

    // Cleanup subscription and interval on unmount
    return () => {
      unsubscribe();
      clearInterval(intervalId);
    };
  }, []);

  return (
    <NetworkContext.Provider value={{ isConnected, checkConnection }}>
      {children}
    </NetworkContext.Provider>
  );
};

export const useNetwork = (): NetworkContextType => {
  const context = useContext(NetworkContext);
  if (!context) {
    throw new Error('useNetwork must be used within a NetworkProvider');
  }
  return context;
};