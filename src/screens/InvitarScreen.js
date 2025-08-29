import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Linking, Share } from 'react-native';
//import QRCode from 'react-native-qrcode-svg';
import * as Clipboard from 'expo-clipboard';
import AppBackground from '../components/AppBackground';

export default function InvitarScreen({ route }) {
  const { grupo } = route.params;
  const enlace = `splitbill://grupo/${grupo._id}`;
  const [copiado, setCopiado] = useState(false);

  const copiarCodigo = async () => {
    await Clipboard.setStringAsync(grupo._id);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 1000);
  };

  const compartirEnlace = async () => {
    try {
      await Share.share({
        message: `Únete a mi grupo SplitBill con este codigo: ${grupo._id}`,
        url: grupo._id
      });
    } catch (e) {
      Alert.alert('Error', 'No se pudo compartir');
    }
  };

  return (
    <View style={styles.container}>
      <AppBackground>
        <Text style={styles.title}>Invitar al grupo</Text>

        <Text style={styles.label}>Código:</Text>
        <View style={styles.codigoRow}>
          <Text style={styles.codigoText}>{grupo._id}</Text>
          <TouchableOpacity onPress={copiarCodigo} style={styles.copyBtn}>
            <Text style={{ color: '#42a5f5', fontWeight: 'bold' }}>
              {copiado ? '¡Copiado!' : 'Copiar'}
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>Enlace:</Text>
        <TouchableOpacity onPress={compartirEnlace}>
          <Text style={styles.enlace}>{enlace}</Text>
          <Text style={styles.compartirTxt}>Toca para compartir</Text>
        </TouchableOpacity>

        {/*<View style={{ marginVertical: 24 }}>
        <QRCode value={grupo._id} size={200} />
      </View>*/}
      </AppBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, alignItems: 'center', backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 16 },
  label: { fontWeight: 'bold', marginTop: 8 },
  codigoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  codigoText: { fontSize: 17, backgroundColor: '#f6f6f6', padding: 4, borderRadius: 4, marginRight: 8 },
  copyBtn: { paddingVertical: 4, paddingHorizontal: 8 },
  enlace: { color: '#1565c0', textDecorationLine: 'underline', fontSize: 16, marginBottom: 0, marginTop: 6 },
  compartirTxt: { color: '#aaa', fontSize: 13, textAlign: 'center', marginBottom: 10 },
});
