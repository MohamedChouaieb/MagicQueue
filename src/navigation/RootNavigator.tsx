import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AuthStack from './AuthStack';
import MainStack from './MainStack';
import { useUser } from '../contexts/UserContext';

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  const { username, loading } = useUser();
  if (loading) return null;

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {username ? (
        <Stack.Screen name="Main" component={MainStack} />
      ) : (
        <Stack.Screen name="Auth" component={AuthStack} />
      )}
    </Stack.Navigator>
  );
}
