import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ConnectionErrorScreen from '../screens/ErrorStack/ConnectionErrorScreen';
import ServerErrorScreen from '../screens/ErrorStack/ServerErrorScreen';

const Stack = createNativeStackNavigator();

export default function ErrorStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ConnectionError" component={ConnectionErrorScreen} />
      <Stack.Screen name="ServerError" component={ServerErrorScreen} />
    </Stack.Navigator>
  );
}