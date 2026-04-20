import React, { useEffect, useRef } from 'react';
import { Alert } from 'react-native';
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
import CustomHeader from './src/components/CustomHeader';
import EstadisticasScreen from './src/screens/EstadisticasScreen';
import { AuthProvider, useAuth } from './src/utils/authContext';
import { ThemeProvider } from './src/utils/themeContext';
import LoginScreen from './src/screens/LoginScreen';
import PerfilScreen from './src/screens/PerfilScreen';
import PagosProgamadosScreen from './src/screens/PagosProgamadosScreen';
import NuevoPagoProgramadoScreen from './src/screens/NuevoPagoProgramadoScreen';
import PresupuestoScreen from './src/screens/PresupuestoScreen';

import { API_URL } from './src/config';

const Stack = createNativeStackNavigator();

// Componente separado para poder usar useAuth dentro del NavigationContainer
function AppNavigator() {
  const { usuario, token } = useAuth();

  useEffect(() => {
    if (usuario?.plan === 'premium' && token) {
      verificarPagosPendientes();
    }
  }, [usuario, token]);

  const verificarPagosPendientes = async () => {
    try {
      const res = await fetch(`${API_URL}/pagos_programados/pendientes`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) return;
      const pendientes = await res.json();
      if (pendientes.length === 0) return;

      // Mostrar pagos pendientes uno a uno
      mostrarPagoPendiente(pendientes, 0);
    } catch (e) {
      console.error('Error verificando pagos pendientes:', e);
    }
  };

  const mostrarPagoPendiente = (pendientes, index) => {
    if (index >= pendientes.length) return;
    const pago = pendientes[index];

    Alert.alert(
      '📅 Pago programado pendiente',
      `"${pago.concepto}" de ${pago.importe.toFixed(2)}€ vence el día ${pago.dia_mes} de este mes.\n\n¿Quieres registrarlo ahora?`,
      [
        {
          text: 'No mostrar este mes',
          style: 'cancel',
          onPress: async () => {
            try {
              await fetch(`${API_URL}/pagos_programados/${pago._id}/omitir`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
              });
            } catch (e) {
              console.error('Error omitiendo pago:', e);
            }
            // Siguiente pago
            mostrarPagoPendiente(pendientes, index + 1);
          }
        },
        {
          text: 'Ahora no',
          onPress: () => mostrarPagoPendiente(pendientes, index + 1)
        },
        {
          text: 'Registrar',
          onPress: async () => {
            try {
              await fetch(`${API_URL}/pagos_programados/${pago._id}/registrar`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
              });
              Alert.alert('✅ Gasto registrado', `"${pago.concepto}" se ha añadido al grupo correctamente.`);
            } catch (e) {
              Alert.alert('Error', 'No se pudo registrar el gasto');
            }
            // Siguiente pago
            mostrarPagoPendiente(pendientes, index + 1);
          }
        }
      ]
    );
  };

  return (
    <Stack.Navigator
      screenOptions={{
        header: () => <CustomHeader />
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
      <Stack.Screen name="Estadisticas" component={EstadisticasScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Perfil" component={PerfilScreen} />
      <Stack.Screen name="PagosProgramados" component={PagosProgamadosScreen} />
      <Stack.Screen name="NuevoPagoProgramado" component={NuevoPagoProgramadoScreen} />
      <Stack.Screen name="Presupuesto" component={PresupuestoScreen} />
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <NavigationContainer>
          <AppNavigator />
        </NavigationContainer>
      </AuthProvider>
    </ThemeProvider>
  );
}