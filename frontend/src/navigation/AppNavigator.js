import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import WelcomeScreen from '../screens/WelcomeScreen';
import InterestsScreen from '../screens/InterestsScreen';
import HomeScreen from '../screens/HomeScreen';
import MatchFoundScreen from '../screens/MatchFoundScreen';
import ChatScreen from '../screens/ChatScreen';

const Stack = createStackNavigator();

export const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          cardStyle: { backgroundColor: '#F8FBF9' },
        }}
        initialRouteName="Welcome"
      >
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="Interests" component={InterestsScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="MatchFound" component={MatchFoundScreen} />
        <Stack.Screen name="Chat" component={ChatScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
