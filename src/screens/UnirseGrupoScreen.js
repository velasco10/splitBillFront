import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { guardarGrupoUnido } from '../utils/localGroups';
import AppBackground from '../components/AppBackground';

export default function UnirseGrupoScreen({ navigation }) {
  const [codigo, setCodigo] = useState('');

  const unirseManual = () => {
    if (!codigo.trim()) return;
    guardarGrupoUnido(codigo)
    Alert.alert('Unido con código', `Te has unido con el código: ${codigo}`);
    navigation.navigate('Home');
  };

  return (
    <View style={styles.container}>
      <AppBackground>
        <Text style={styles.title}>Unirse a un grupo</Text>
        <TextInput
          placeholder="Introduce código del grupo"
          placeholderTextColor="#6B7280"
          style={styles.input}
          value={codigo}
          onChangeText={setCodigo}
        />
        <Button title="Unirse" onPress={unirseManual} disabled={!codigo} />
      </AppBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center', backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
  input: {
    borderBottomWidth: 2,
    borderBottomColor: '#42a5f5',
    marginBottom: 20,
    paddingVertical: 6,
    fontSize: 16,
  },
});
