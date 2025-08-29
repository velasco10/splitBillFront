// src/components/CustomHeader.js
import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const titulos={Home:'Billary',CrearGrupo:'Crear Grupo',DetalleGrupo:'Detalle',NuevoGasto:'Nuevo Gasto',DesgloseGastos:'Desglose',DetalleGasto:'Detalle Gasto',UnirseGrupo:'Unirse',Invitar:'Invitar',AgregarPersona:'Añadir Persona',AgregarPersonas:'Añadir Personas',CamaraScreen:'Dividir Cuenta',AsignarProductosScreen:'Asignar',TotalesPorPersona:'Totales',AjustarCuentas:'Ajustes'};

export default function CustomHeader(){
  const navigation=useNavigation(); const route=useRoute();
  const title=titulos[route.name]||'Billary';
  const HIDE_BACK = ['Home','AsignarProductosScreen','DetalleGrupo']; // EDITA
  const showBack = navigation.canGoBack() && !HIDE_BACK.includes(route.name);

  return (
    <View style={styles.wrap}>
      <LinearGradient colors={['#ffffff','#cce6ff']} style={StyleSheet.absoluteFill}/>
      <View style={styles.row}>
        {showBack ? (
          <TouchableOpacity style={styles.side} onPress={()=>navigation.goBack()} hitSlop={{top:10,bottom:10,left:10,right:10}}>
            <Ionicons name="arrow-back" size={24} color="#111"/>
          </TouchableOpacity>
        ) : <View style={styles.side}/>}

        <TouchableOpacity style={styles.center} onPress={()=>navigation.navigate('Home')}>
          <Image source={require('../../assets/BillaryLogo.png')} style={{width:36,height:36,marginRight:8}}/>
          <Text style={{fontSize:20,fontWeight:'700'}}>{title}</Text>
        </TouchableOpacity>

        <View style={styles.side}/>
      </View>
    </View>
  );
}

const styles=StyleSheet.create({
  wrap:{height:90},
  row:{flex:1,flexDirection:'row',alignItems:'flex-end',justifyContent:'space-between',paddingTop:40,paddingBottom:8,paddingHorizontal:12},
  side:{width:44,height:44,alignItems:'center',justifyContent:'center'},
  center:{flexDirection:'row',alignItems:'center',justifyContent:'center',flex:1},
});
