import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';

const Spinner = () => {
  const rotation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const startRotation = () => {
      rotation.setValue(0);
      Animated.loop(
        Animated.timing(rotation, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        })
      ).start();
    };

    startRotation();
  }, [rotation]);

  const spin = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.container}>
      <Animated.View style={{ transform: [{ rotate: spin }] }}>
        <View style={styles.spinner} />
      </Animated.View>
    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  spinner: {
    width: 50,
    height: 50,
    borderWidth: 5,
    borderColor: '#6200ee',
    borderTopColor: 'transparent',
    borderRadius: 25,
  },
});

export default Spinner;
