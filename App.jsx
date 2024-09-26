// App.js
import React from "react";
import { Provider } from "react-native-paper";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { theme } from "./app/core/theme";
import {
  StartScreen,
  LoginScreen,
  RegisterScreen,
  ResetPasswordScreen,
  HomeScreen,
  ProfileScreen,
  AddCardScreen,
} from "./app/screens";
import { CardDataProvider } from "./app/context/CardDataContext"; // Import the provider

const Stack = createStackNavigator();

export default function App() {
  return (
    <CardDataProvider>
      {/* Wrap the app with the CardDataProvider */}
      <Provider theme={theme}>
        <NavigationContainer>
          <Stack.Navigator
            initialRouteName="HomeScreen"
            screenOptions={{
              headerShown: false,
            }}
          >
            <Stack.Screen name="StartScreen" component={StartScreen} />
            <Stack.Screen name="LoginScreen" component={LoginScreen} />
            <Stack.Screen name="RegisterScreen" component={RegisterScreen} />
            <Stack.Screen name="HomeScreen" component={HomeScreen} />
            <Stack.Screen
              name="ResetPasswordScreen"
              component={ResetPasswordScreen}
            />
            <Stack.Screen name="ProfileScreen" component={ProfileScreen} />
            <Stack.Screen name="AddCardScreen" component={AddCardScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </Provider>
    </CardDataProvider>
  );
}
