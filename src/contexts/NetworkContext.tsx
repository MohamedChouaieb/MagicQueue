import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { useNavigation, CommonActions } from '@react-navigation/native';
import NetInfo from '@react-native-community/netinfo';

type NetworkContextType = {
  isConnected: boolean | null;
  checkConnection: () => Promise<boolean>;
};

const NetworkContext = createContext<NetworkContextType | undefined>(undefined);

export const NetworkProvider = ({ children }: { children: ReactNode }) => {
  const [isConnected, setIsConnected] = useState<boolean | null>(true);
  const navigation = useNavigation();

  const checkConnection = async (): Promise<boolean> => {
    try {
      const state = await NetInfo.fetch();
      setIsConnected(state.isConnected);
      return !!state.isConnected;
    } catch (error) {
      console.error("Failed to check connection:", error);
      setIsConnected(false);
      return false;
    }
  };

  useEffect(() => {
    // Initial check
    checkConnection();

    // Subscribe to network state updates
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected);
      
      // Navigate to ConnectionError screen when connection is lost
      if (state.isConnected === false) {
        navigation.dispatch(
          CommonActions.navigate({
            name: 'Error',
            params: {
              screen: 'ConnectionError'
            }
          })
        );
      }
    });

    // Cleanup subscription on unmount
    return () => {
      unsubscribe();
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