import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from './src/screens/HomeScreen';
import CrearGrupoScreen from './src/screens/CrearGrupoScreen';
import DetalleGrupoScreen from './src/screens/DetalleGrupoScreen';
import NuevoGastoScreen from './src/screens/NuevoGastoScreen';
import DesgloseGastosScreen from './src/screens/DesgloseGastosScreen';
import DetalleGastoScreen from './src/screens/DetalleGastoScreen';
import UnirseGrupoScreen from './src/screens/UnirseGrupoScreen';
import InvitarScreen from './src/screens/InvitarScreen';
import AgregarPersonasScreen from './src/screens/AgregarPersonasScreen';
import AgregarPersonaScreen from './src/screens/AgregarPersonaScreen';
import CamaraScreen from './src/screens/CamaraScreen';
import AsignarProductosScreen from './src/screens/AsignarProductosScreen';
import TotalesPorPersona from './src/screens/TotalesPorPersona';
import AjustarCuentasScreen from './src/screens/AjustarCuentasScreen';
import CustomHeader from './src/components/CustomHeader'; // <-- Importa tu componente

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          header: () => <CustomHeader />, 
        }}
      >
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="CrearGrupo" component={CrearGrupoScreen} />
        <Stack.Screen name="DetalleGrupo" component={DetalleGrupoScreen} />
        <Stack.Screen name="NuevoGasto" component={NuevoGastoScreen} />
        <Stack.Screen name="DesgloseGastos" component={DesgloseGastosScreen} />
        <Stack.Screen name="DetalleGasto" component={DetalleGastoScreen} />
        <Stack.Screen name="UnirseGrupo" component={UnirseGrupoScreen} />
        <Stack.Screen name="Invitar" component={InvitarScreen} />
        <Stack.Screen name="AgregarPersona" component={AgregarPersonaScreen} />
        <Stack.Screen name="AgregarPersonas" component={AgregarPersonasScreen} />
        <Stack.Screen name="CamaraScreen" component={CamaraScreen} />
        <Stack.Screen name="AsignarProductosScreen" component={AsignarProductosScreen} />
        <Stack.Screen name="TotalesPorPersona" component={TotalesPorPersona} />
        <Stack.Screen name="AjustarCuentas" component={AjustarCuentasScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}