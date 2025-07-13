import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, TouchableOpacity } from 'react-native';
import { Menu, Provider } from 'react-native-paper';
import { API_URL } from '@env';

export default function NuevoGastoScreen({ route, navigation }) {
  const { grupo } = route.params;
  const [importe, setImporte] = useState('');
  const [concepto, setConcepto] = useState('');
  const [emisor, setEmisor] = useState(grupo.miembros[0]);
  const [beneficiarios, setBeneficiarios] = useState([...grupo.miembros]);

  // Para el menú desplegable
  const [menuVisible, setMenuVisible] = useState(false);
  const openMenu = () => setMenuVisible(true);
  const closeMenu = () => setMenuVisible(false);

  const toggleBeneficiario = (m) => {
    setBeneficiarios(prev =>
      prev.includes(m)
        ? prev.filter(b => b !== m)
        : [...prev, m]
    );
  };

  const guardarGasto = async () => {
    const gasto = {
      grupoId: grupo._id,
      importe: parseFloat(importe),
      concepto,
      emisor,
      beneficiarios,
    };
    await fetch(`${API_URL}/gastos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(gasto),
    });
    navigation.goBack();
  };

  return (
    <Provider>
      <View style={styles.container}>
        <Text style={styles.title}>Nuevo Gasto</Text>
        <TextInput
          placeholder="Importe (€)"
          style={styles.input}
          value={importe}
          onChangeText={setImporte}
          keyboardType="decimal-pad"
        />
        <TextInput
          placeholder="Concepto"
          style={styles.input}
          value={concepto}
          onChangeText={setConcepto}
        />
        <Text style={styles.label}>De:</Text>
        <Menu
          visible={menuVisible}
          onDismiss={closeMenu}
          anchor={
            <TouchableOpacity onPress={openMenu} style={styles.dropdown}>
              <Text style={{ fontSize: 16 }}>{emisor}</Text>
            </TouchableOpacity>
          }
        >
          {grupo.miembros.map(m => (
            <Menu.Item
              onPress={() => {
                setEmisor(m);
                closeMenu();
              }}
              title={m}
              key={m}
            />
          ))}
        </Menu>

        <Text style={styles.label}>Para:</Text>
        <View style={styles.row}>
          {grupo.miembros.map(m => (
            <TouchableOpacity
              key={m}
              onPress={() => toggleBeneficiario(m)}
              style={[styles.selector, beneficiarios.includes(m) && styles.selectorSelected]}
            >
              <Text>{m}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <Button
          title="Guardar gasto"
          onPress={guardarGasto}
          disabled={!importe || !concepto || !emisor || beneficiarios.length === 0}
        />
      </View>
    </Provider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 16 },
  input: { marginBottom: 16 },
  label: { fontWeight: 'bold', marginTop: 12, marginBottom: 6, fontSize: 16 },
  dropdown: {
    borderBottomWidth: 2,
    borderBottomColor: '#42a5f5',
    paddingVertical: 8,
    marginBottom: 16,
    minWidth: 120,
  },
  row: { flexDirection: 'row', marginBottom: 16, flexWrap: 'wrap' },
  selector: {
    borderWidth: 1,
    borderColor: '#aaa',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 20,
    marginRight: 8,
    marginBottom: 8,
    backgroundColor: '#eee',
  },
  selectorSelected: {
    backgroundColor: '#b3e5fc',
    borderColor: '#42a5f5',
  },
});
