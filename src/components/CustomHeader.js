// src/components/CustomHeader.js
import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';

const titulos = {
  Home: 'Billary',
  CrearGrupo: 'Crear Grupo',
  DetalleGrupo: 'Detalle',
  NuevoGasto: 'Nuevo Gasto',
  DesgloseGastos: 'Desglose',
  DetalleGasto: 'Detalle Gasto',
  UnirseGrupo: 'Unirse',
  Invitar: 'Invitar',
  AgregarPersona: 'Añadir Persona',
  AgregarPersonas: 'Añadir Personas',
  CamaraScreen: 'Cámara',
  AsignarProductosScreen: 'Asignar',
  TotalesPorPersona: 'Totales',
  AjustarCuentas: 'Ajustes',
};

export default function CustomHeader() {
  const navigation = useNavigation();
  const route = useRoute();
  
  const title = titulos[route.name] || 'Billary';

  return (
    <View style={styles.headerContainer}>
      <LinearGradient
        colors={['#ffffff', '#cce6ff']}
        style={StyleSheet.absoluteFill}
      />
      <TouchableOpacity
        onPress={() => navigation.navigate('Home')}
        style={styles.headerContent}
      >
        <Image
          source={require('../../assets/BillaryLogo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.titleText}>{title}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    height: 90, // Altura de la cabecera, es importante
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 15,
    paddingTop: 40, // Ajusta el padding para que el contenido no quede en la zona de la muesca del móvil
  },
  logo: {
    width: 50,
    height: 50,
    marginRight: 8,
  },
  titleText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});