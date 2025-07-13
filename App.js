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

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'SplitBill' }} />
        <Stack.Screen name="CrearGrupo" component={CrearGrupoScreen} options={{ title: 'Crear Grupo' }} />
        <Stack.Screen name="DetalleGrupo" component={DetalleGrupoScreen} options={{ title: 'Detalle Grupo' }} />
        <Stack.Screen name="NuevoGasto" component={NuevoGastoScreen} options={{ title: 'Nuevo Gasto' }} />
        <Stack.Screen name="DesgloseGastos" component={DesgloseGastosScreen} options={{ title: 'Desglose de gastos' }} />
        <Stack.Screen name="DetalleGasto" component={DetalleGastoScreen} options={{ title: 'Detalle del gasto' }} />
        <Stack.Screen name="UnirseGrupo" component={UnirseGrupoScreen} options={{ title: 'Unirse a grupo' }} />
        <Stack.Screen name="Invitar" component={InvitarScreen} options={{ title: 'Invitar al grupo' }} />
        <Stack.Screen name="AgregarPersona" component={AgregarPersonaScreen} options={{ title: 'Añadir persona' }} />
        <Stack.Screen name="AgregarPersonas" component={AgregarPersonasScreen} options={{ title: 'Añadir personas' }} />
        <Stack.Screen name="CamaraScreen" component={CamaraScreen} />
        <Stack.Screen name="AsignarProductosScreen" component={AsignarProductosScreen} />
        <Stack.Screen name="TotalesPorPersona" component={TotalesPorPersona} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
