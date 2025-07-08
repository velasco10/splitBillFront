import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';

export default function UnirseGrupoScreen({ navigation }) {
  const [codigo, setCodigo] = useState('');

  const buscarGrupo = async () => {
    try {
      const res = await fetch(`http://localhost:8000/grupos/${codigo}`);
      if (!res.ok) throw new Error('No existe el grupo');
      const grupo = await res.json();
      navigation.navigate('DetalleGrupo', { grupo });
    } catch (e) {
      Alert.alert('Error', 'No se encontró el grupo con ese código.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Unirse a grupo</Text>
      <TextInput
        placeholder="Introduce el código del grupo"
        style={styles.input}
        value={codigo}
        onChangeText={setCodigo}
        autoCapitalize="none"
      />
      <Button title="Entrar" onPress={buscarGrupo} disabled={!codigo} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 16 },
  input: {
    borderBottomWidth: 2,
    borderBottomColor: '#42a5f5',
    marginBottom: 16,
    paddingVertical: 6,
    fontSize: 16,
  },
});
