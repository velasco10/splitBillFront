import React from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function HeaderGradient() {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <LinearGradient
        colors={['#ffffff', '#cce6ff']}
        style={StyleSheet.absoluteFill}
      />
    </View>
  );
}
