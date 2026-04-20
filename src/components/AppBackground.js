import React from 'react';
import { ImageBackground, StyleSheet, View } from 'react-native';
import { useTheme } from '../utils/themeContext';

export default function AppBackground({ children }) {
  const { theme } = useTheme();

  return (
    <View style={[styles.wrapper, { backgroundColor: theme.fondo }]}>
      <ImageBackground
        source={require('../../assets/bg_logo.png')}
        resizeMode="contain"
        style={styles.bg}
        imageStyle={{
          opacity: theme.modo === 'oscuro' ? 0.08 : 0.50,
        }}
      >
        {children}
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1 },
  bg:      { flex: 1, padding: 16 },
});