import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';

import LoanRequestScreen from '../screens/LoanRequestScreen';
import AdminDashboardScreen from '../screens/AdminDashboardScreen';
import LedgerScreen from '../screens/LedgerScreen';

const Tab = createBottomTabNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Tab.Navigator screenOptions={{ headerTitleAlign: 'center' }}>
        <Tab.Screen name="Apply" component={LoanRequestScreen} options={{ title: 'Loan Application' }} />
        <Tab.Screen name="Admin" component={AdminDashboardScreen} options={{ title: 'Admin Approvals' }} />
        <Tab.Screen name="Ledger" component={LedgerScreen} options={{ title: 'Ledger' }} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}