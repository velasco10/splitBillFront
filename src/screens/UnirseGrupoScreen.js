import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { BarCodeScanner } from 'expo-barcode-scanner';

export default function UnirseGrupoScreen({ navigation }) {
  const [codigo, setCodigo] = useState('');
  const [permisoCamara, setPermisoCamara] = useState(null);
  const [modoQR, setModoQR] = useState(false);

  useEffect(() => {
    BarCodeScanner.requestPermissionsAsync().then(({ status }) => {
      setPermisoCamara(status === 'granted');
    });
  }, []);

  const manejarEscaneo = ({ data }) => {
    setModoQR(false);
    setCodigo(data); // asume que el QR contiene el código
    Alert.alert('Código escaneado', `Te has unido con el código: ${data}`);
    // Aquí puedes llamar a la API para unirse al grupo
  };

  const unirseManual = () => {
    // validación y navegación
    Alert.alert('Unido con código', `Te has unido con el código: ${codigo}`);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Unirse a un grupo</Text>

      {modoQR ? (
        <BarCodeScanner
          onBarCodeScanned={manejarEscaneo}
          style={styles.qr}
        />
      ) : (
        <>
          <TextInput
            placeholder="Introduce código del grupo"
            style={styles.input}
            value={codigo}
            onChangeText={setCodigo}
          />
          <Button title="Unirse" onPress={unirseManual} disabled={!codigo} />
          <View style={{ height: 16 }} />
          <Button
            title="Escanear QR"
            onPress={() => setModoQR(true)}
            disabled={!permisoCamara}
          />
        </>
      )}
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
  qr: { width: '100%', height: 300, marginTop: 20 },
});
