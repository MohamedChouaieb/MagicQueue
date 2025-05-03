import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Dashboard from '../screens/MainStack/DashboardScreen';
import ProfileScreen from '../screens/MainStack/ProfileScreen';

const Stack = createNativeStackNavigator();

export default function MainStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Dashboard" component={Dashboard} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
    </Stack.Navigator>
  );
}
