import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Animated, Image } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import CreateAccount from './screens/CreateAccount';
import SignIn from './screens/SignIn';
import Dashboard from './screens/Dashboard';
import DepositMoney from './screens/DepositMoney';

const Stack = createStackNavigator();

export default function App() {
  const [loading, setLoading] = useState(true);
  const fadeAnim = useState(new Animated.Value(0))[0]; // Fade animation
  const scaleAnim = useState(new Animated.Value(0.8))[0]; // Scale animation
  const bounceAnim = useState(new Animated.Value(1))[0]; // Bouncing effect

  useEffect(() => {
    // Start the animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 3,
        tension: 100,
        useNativeDriver: true,
      }),
      // Bounce effect runs only once
      Animated.timing(bounceAnim, {
        toValue: 1.3, // Scale up slightly
        duration: 1000, // Duration of the bounce
        useNativeDriver: true,
      }),
    ]).start();

    // Set a timeout to transition to the main app after animations
    setTimeout(() => {
      setLoading(false);
    }, 3000); // Adjust this time as needed for your desired loading duration
  }, [fadeAnim, scaleAnim, bounceAnim]);

  if (loading) {
    return (
      <View style={styles.container}>
        {/* Logo Image */}
        <Image
          source={require('./assets/bitcoin.png')} // Adjust the path to your logo
          style={styles.logo}
          resizeMode="contain"
        />
        <Animated.Text
          style={{
            ...styles.title,
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          }}>
          Welcome to BankApp
        </Animated.Text>
        <Animated.Text
          style={{
            ...styles.subtitle,
            transform: [{ scale: bounceAnim }], // Apply bounce effect
          }}>
          Your Trustworthy Banking Partner
        </Animated.Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="SignIn">
        <Stack.Screen
          name="SignIn"
          component={SignIn}
          options={{
            headerShown: false, // Hides the header
          }}
        />
        <Stack.Screen
          name="CreateAccount"
          component={CreateAccount}
          options={{
            headerShown: false, // Hides the header
          }}
        />
        <Stack.Screen
          name="Dashboard"
          component={Dashboard}
          options={{
            headerShown: false, // Hides the header
          }}
        />
        <Stack.Screen name="DepositMoney" component={DepositMoney} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#6200ee',
  },
  logo: {
    width: 100, // Adjust the size of the logo
    height: 100, // Adjust the size of the logo
    marginBottom: 20, // Spacing between the logo and title
  },
  title: {
    color: 'white',
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 10,
    fontFamily: 'Arial', // Change this to any system font
  },
  subtitle: {
    color: 'white',
    fontSize: 14,
    fontFamily: 'Arial', // Change this to any system font
  },
});
