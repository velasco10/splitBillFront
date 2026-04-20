import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Share, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import AppBackground from '../components/AppBackground';
import { useTheme } from '../utils/themeContext';

export default function InvitarScreen({ route }) {
  const { grupo }  = route.params;
  const { theme }  = useTheme();
  const [copiado, setCopiado] = useState(false);

  const copiarCodigo = async () => {
    await Clipboard.setStringAsync(grupo._id);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  };

  const compartir = async () => {
    try {
      await Share.share({ message: `Únete a mi grupo "${grupo.nombre}" en SplitBill. Usa este código: ${grupo._id}` });
    } catch (e) { Alert.alert('Error', 'No se pudo compartir'); }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.fondo }]}>
      <View style={[styles.container, { backgroundColor: theme.fondo }]}>
        <AppBackground>
          <Text style={[styles.title, { color: theme.texto }]}>Invitar al grupo</Text>
          <Text style={[styles.subtitle, { color: theme.textoSecundario }]}>
            Comparte el código con quienes quieras añadir a{' '}
            <Text style={[styles.grupoNombre, { color: theme.texto }]}>"{grupo.nombre}"</Text>
          </Text>

          {grupo.miembros?.length > 0 && (
            <View style={[styles.miembrosCard, { backgroundColor: theme.fondoCard }]}>
              <Text style={[styles.miembrosLabel, { color: theme.textoTerciario }]}>Miembros actuales</Text>
              <Text style={[styles.miembrosTexto, { color: theme.texto }]}>{grupo.miembros.join(', ')}</Text>
            </View>
          )}

          <Text style={[styles.label, { color: theme.texto }]}>Código del grupo</Text>
          <View style={[styles.codigoCard, { backgroundColor: theme.primaryLight }]}>
            <Text style={[styles.codigoText, { color: theme.texto }]} numberOfLines={1} ellipsizeMode="middle">
              {grupo._id}
            </Text>
            <TouchableOpacity onPress={copiarCodigo} style={styles.copyBtn}>
              <Ionicons name={copiado ? 'checkmark-circle' : 'copy-outline'} size={22} color={copiado ? theme.success : theme.primary} />
              <Text style={[styles.copyBtnText, { color: copiado ? theme.success : theme.primary }]}>
                {copiado ? '¡Copiado!' : 'Copiar'}
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={[styles.instruccion, { color: theme.textoSecundario }]}>
            La otra persona debe ir a <Text style={[styles.bold, { color: theme.texto }]}>Unirse a grupo</Text> e introducir este código.
          </Text>

          <TouchableOpacity style={[styles.btnCompartir, { backgroundColor: theme.primary }]} onPress={compartir}>
            <Ionicons name="share-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
            <Text style={styles.btnCompartirText}>Compartir código</Text>
          </TouchableOpacity>
        </AppBackground>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea:      { flex: 1 },
  container:     { flex: 1, padding: 24 },
  title:         { fontSize: 22, fontWeight: 'bold', marginBottom: 8 },
  subtitle:      { fontSize: 14, marginBottom: 20 },
  grupoNombre:   { fontWeight: '700' },
  miembrosCard:  { borderRadius: 10, padding: 12, marginBottom: 20 },
  miembrosLabel: { fontSize: 12, marginBottom: 4 },
  miembrosTexto: { fontSize: 14 },
  label:         { fontWeight: '600', fontSize: 15, marginBottom: 8 },
  codigoCard:    { flexDirection: 'row', alignItems: 'center', borderRadius: 12, padding: 14, marginBottom: 12, gap: 10 },
  codigoText:    { flex: 1, fontSize: 15, fontFamily: 'monospace' },
  copyBtn:       { flexDirection: 'row', alignItems: 'center', gap: 4 },
  copyBtnText:   { fontWeight: '700', fontSize: 14 },
  instruccion:   { fontSize: 13, marginBottom: 28, lineHeight: 20 },
  bold:          { fontWeight: '700' },
  btnCompartir:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderRadius: 12, padding: 16 },
  btnCompartirText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});