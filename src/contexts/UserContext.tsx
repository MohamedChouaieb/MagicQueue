import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type UserContextType = {
  username: string | null;
  setUsername: (username: string | null) => void;
  loading: boolean;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [username, setUsernameState] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUsername = async () => {
      try {
        const storedUsername = await AsyncStorage.getItem('@username');
        if (storedUsername) {
          setUsernameState(storedUsername);
        }
      } catch (error) {
        console.error("Failed to load username:", error);
      } finally {
        setLoading(false);
      }
    };

    loadUsername();
  }, []);

  const setUsername = async (newUsername: string | null) => {
    try {
      if (newUsername) {
        await AsyncStorage.setItem('@username', newUsername);
      } else {
        await AsyncStorage.removeItem('@username');
      }
      setUsernameState(newUsername);
    } catch (error) {
      console.error("Failed to set username:", error);
    }
  };

  return (
    <UserContext.Provider value={{ username, setUsername, loading }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
