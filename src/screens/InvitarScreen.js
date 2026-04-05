import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Alert, Share, SafeAreaView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import AppBackground from '../components/AppBackground';

export default function InvitarScreen({ route }) {
  const { grupo } = route.params;
  const [copiado, setCopiado] = useState(false);

  const copiarCodigo = async () => {
    await Clipboard.setStringAsync(grupo._id);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  };

  const compartir = async () => {
    try {
      await Share.share({
        message: `Únete a mi grupo "${grupo.nombre}" en SplitBill. Usa este código: ${grupo._id}`,
      });
    } catch (e) {
      Alert.alert('Error', 'No se pudo compartir');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <AppBackground>
          <Text style={styles.title}>Invitar al grupo</Text>
          <Text style={styles.subtitle}>
            Comparte el código con quienes quieras añadir a <Text style={styles.grupoNombre}>"{grupo.nombre}"</Text>
          </Text>

          {/* Miembros actuales */}
          {grupo.miembros?.length > 0 && (
            <View style={styles.miembrosCard}>
              <Text style={styles.miembrosLabel}>Miembros actuales</Text>
              <Text style={styles.miembrosTexto}>{grupo.miembros.join(', ')}</Text>
            </View>
          )}

          {/* Código */}
          <Text style={styles.label}>Código del grupo</Text>
          <View style={styles.codigoCard}>
            <Text style={styles.codigoText} numberOfLines={1} ellipsizeMode="middle">
              {grupo._id}
            </Text>
            <TouchableOpacity onPress={copiarCodigo} style={styles.copyBtn}>
              <Ionicons
                name={copiado ? 'checkmark-circle' : 'copy-outline'}
                size={22}
                color={copiado ? '#2ecc71' : '#42a5f5'}
              />
              <Text style={[styles.copyBtnText, { color: copiado ? '#2ecc71' : '#42a5f5' }]}>
                {copiado ? '¡Copiado!' : 'Copiar'}
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.instruccion}>
            La otra persona debe ir a <Text style={styles.bold}>Unirse a grupo</Text> e introducir este código.
          </Text>

          {/* Botón compartir */}
          <TouchableOpacity style={styles.btnCompartir} onPress={compartir}>
            <Ionicons name="share-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
            <Text style={styles.btnCompartirText}>Compartir código</Text>
          </TouchableOpacity>

        </AppBackground>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea:  { flex: 1, backgroundColor: '#fff' },
  container: { flex: 1, padding: 24, backgroundColor: '#fff' },
  title:     { fontSize: 22, fontWeight: 'bold', marginBottom: 8 },
  subtitle:  { fontSize: 14, color: '#888', marginBottom: 20 },
  grupoNombre: { fontWeight: '700', color: '#333' },

  miembrosCard: {
    backgroundColor: '#f8f9fa', borderRadius: 10,
    padding: 12, marginBottom: 20,
  },
  miembrosLabel: { fontSize: 12, color: '#aaa', marginBottom: 4 },
  miembrosTexto: { fontSize: 14, color: '#333' },

  label: { fontWeight: '600', fontSize: 15, color: '#333', marginBottom: 8 },

  codigoCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#f0f4ff', borderRadius: 12,
    padding: 14, marginBottom: 12, gap: 10,
  },
  codigoText: { flex: 1, fontSize: 15, color: '#333', fontFamily: 'monospace' },
  copyBtn:     { flexDirection: 'row', alignItems: 'center', gap: 4 },
  copyBtnText: { fontWeight: '700', fontSize: 14 },

  instruccion: { fontSize: 13, color: '#888', marginBottom: 28, lineHeight: 20 },
  bold: { fontWeight: '700', color: '#555' },

  btnCompartir: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#42a5f5', borderRadius: 12,
    padding: 16,
  },
  btnCompartirText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});