import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { Text } from 'react-native';

import LoanRequestScreen from '../screens/LoanRequestScreen';
import AdminDashboardScreen from '../screens/AdminDashboardScreen';
import LedgerScreen from '../screens/LedgerScreen';
import HelpScreen from '../screens/HelpScreen';

const Tab = createBottomTabNavigator();

const TAB_ICONS = {
  Apply: '📝',
  Admin: '✅',
  Ledger: '📒',
  Help: '📘',
};

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerTitleAlign: 'center',
          headerStyle: {
            backgroundColor: '#0F172A',
            shadowColor: '#000',
            shadowOpacity: 0.3,
            shadowRadius: 10,
            shadowOffset: { width: 0, height: 4 },
            elevation: 8,
          },
          headerTintColor: '#F8FAFC',
          headerTitleStyle: {
            fontWeight: 'bold',
            fontSize: 17,
          },
          tabBarStyle: {
            backgroundColor: '#0F172A',
            borderTopColor: '#1E293B',
            borderTopWidth: 1,
            height: 60,
            paddingTop: 6,
            paddingBottom: 6,
            shadowColor: '#000',
            shadowOpacity: 0.4,
            shadowRadius: 12,
            shadowOffset: { width: 0, height: -4 },
            elevation: 12,
          },
          tabBarActiveTintColor: '#3B82F6',
          tabBarInactiveTintColor: '#64748B',
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: '600',
          },
          tabBarIcon: ({ focused }) => (
            <Text style={{ fontSize: 22, opacity: focused ? 1 : 0.5 }}>
              {TAB_ICONS[route.name]}
            </Text>
          ),
        })}
      >
        <Tab.Screen
          name="Apply"
          component={LoanRequestScreen}
          options={{ title: 'Loan Application' }}
        />
        <Tab.Screen
          name="Admin"
          component={AdminDashboardScreen}
          options={{ title: 'Admin Approvals' }}
        />
        <Tab.Screen
          name="Ledger"
          component={LedgerScreen}
          options={{ title: 'Ledger' }}
        />
        <Tab.Screen
          name="Help"
          component={HelpScreen}
          options={{ title: 'Help / Mwongozo' }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}