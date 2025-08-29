// src/components/AppBackground.js
import React from 'react';
import { ImageBackground, StyleSheet } from 'react-native';

export default function AppBackground({ children }) {
  return (
    <ImageBackground
      source={require('../../assets/bg_logo.png')}
      resizeMode="contain"
      style={styles.bg}
      imageStyle={{ opacity: 0.50 }}
    >
      {children}
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: {
    flex: 1,
    padding: 16,
  },
});
