import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type UserContextType = {
  username: string | null;
  setUsername: (username: string | null) => void;
  userId: number | null;
  setUserId: (id: number | null) => void;
  counterId: number | null;
  setCounterId: (id: number | null) => void;
  departmentId: number | null;
  setDepartmentId: (id: number | null) => void;
  fullName: string | null;
  setFullName: (name: string | null) => void;
  counterName: string | null;
  setCounterName: (name: string | null) => void;
  departmentName: string | null;
  setDepartmentName: (name: string | null) => void;
  totalServed: number | null;
  setTotalServed: (count: number | null) => void;
  waitingTime: number | null;
  setWaitingTime: (time: number | null) => void;
  loading: boolean;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [username, setUsernameState] = useState<string | null>(null);
  const [userId, setUserIdState] = useState<number | null>(null);
  const [counterId, setCounterIdState] = useState<number | null>(null);
  const [departmentId, setDepartmentIdState] = useState<number | null>(null);
  const [fullName, setFullNameState] = useState<string | null>(null);
  const [counterName, setCounterNameState] = useState<string | null>(null);
  const [departmentName, setDepartmentNameState] = useState<string | null>(null);
  const [totalServed, setTotalServedState] = useState<number | null>(null);
  const [waitingTime, setWaitingTimeState] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const keysAndSetters = [
          { key: '@username', setter: setUsernameState },
          { key: '@userId', setter: (v: string) => setUserIdState(Number(v)) },
          { key: '@counterId', setter: (v: string) => setCounterIdState(Number(v)) },
          { key: '@departmentId', setter: (v: string) => setDepartmentIdState(Number(v)) },
          { key: '@fullName', setter: setFullNameState },
          { key: '@counterName', setter: setCounterNameState },
          { key: '@departmentName', setter: setDepartmentNameState },
          { key: '@totalServed', setter: (v: string) => setTotalServedState(Number(v)) },
          { key: '@waitingTime', setter: (v: string) => setWaitingTimeState(Number(v)) },
        ];

        for (const { key, setter } of keysAndSetters) {
          const value = await AsyncStorage.getItem(key);
          if (value !== null) setter(value);
        }
      } catch (error) {
        console.error("Failed to load data from storage:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const createSetter = <T,>(key: string, setState: React.Dispatch<React.SetStateAction<T>>) => 
    async (value: T) => {
      try {
        if (value !== null && value !== undefined) {
          await AsyncStorage.setItem(key, value.toString());
        } else {
          await AsyncStorage.removeItem(key);
        }
        setState(value);
      } catch (error) {
        console.error(`Failed to set ${key}:`, error);
      }
    };

  return (
    <UserContext.Provider value={{
      username,
      setUsername: createSetter('@username', setUsernameState),
      userId,
      setUserId: createSetter('@userId', setUserIdState),
      counterId,
      setCounterId: createSetter('@counterId', setCounterIdState),
      departmentId,
      setDepartmentId: createSetter('@departmentId', setDepartmentIdState),
      fullName,
      setFullName: createSetter('@fullName', setFullNameState),
      counterName,
      setCounterName: createSetter('@counterName', setCounterNameState),
      departmentName,
      setDepartmentName: createSetter('@departmentName', setDepartmentNameState),
      totalServed,
      setTotalServed: createSetter('@totalServed', setTotalServedState),
      waitingTime,
      setWaitingTime: createSetter('@waitingTime', setWaitingTimeState),
      loading,
    }}>
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
