import React, { useEffect, useRef } from 'react';
import { Image, StyleSheet, Animated, Dimensions, StatusBar } from 'react-native';

const SCREEN_HEIGHT = Dimensions.get('screen').height;
const SCREEN_WIDTH = Dimensions.get('screen').width;

export default function CustomSplash({ onFinish }) {
  const fadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Tampilkan splash selama 2 detik, lalu fade out
    const timer = setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start(() => {
        onFinish();
      });
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <StatusBar hidden={true} />
      <Image
        source={require('../assets/splash-screen.png')}
        style={styles.image}
        resizeMode="stretch"
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    backgroundColor: '#8B5CF6',
    zIndex: 9999,
    elevation: 9999,
  },
  image: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
});
