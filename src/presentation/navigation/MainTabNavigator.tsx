import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { HomeScreen } from '../screens/HomeScreen';
import { FinancialScreen } from '../screens/FinancialScreen';
import { COLORS } from '../../core/constants/constants';
import { Ionicons } from '@expo/vector-icons';
import { View, StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const Tab = createBottomTabNavigator();

/**
 * Componente auxiliar para renderizar os ícones da TabBar.
 * Adiciona um fundo colorido quando ativo para destaque visual.
 */
const TabBarIcon = ({ name, focused }: { name: any; focused: boolean }) => (
    <View style={[styles.iconContainer, focused && styles.iconActive]}>
        <Ionicons
            name={focused ? name.replace('-outline', '') : name}
            size={22}
            color={focused ? '#FFF' : COLORS.textSecondary}
        />
    </View>
);

/**
 * @component MainTabNavigator
 * Navegador de abas inferior principal.
 * Contém as telas principais: Rascunhos, Aguardando, Finalizados e Relatório Financeiro.
 */
export const MainTabNavigator = () => {
    const insets = useSafeAreaInsets();

    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: false,
                tabBarStyle: {
                    ...styles.tabBar,
                    // Altura automática mas com mínimo definido para aparência premium
                    height: undefined,
                    minHeight: 90,
                    paddingBottom: insets.bottom + 16, // Garante área segura inferior generosa
                    paddingTop: 16,
                },
                tabBarShowLabel: true,
                tabBarActiveTintColor: COLORS.primary,
                tabBarInactiveTintColor: COLORS.textSecondary,
                tabBarLabelStyle: styles.tabBarLabel,
            }}
        >
            <Tab.Screen
                name="Drafts"
                component={HomeScreen}
                initialParams={{ filterStatus: 'draft' }}
                options={{
                    tabBarLabel: 'Rascunhos',
                    tabBarIcon: ({ focused }) => <TabBarIcon name="document-text-outline" focused={focused} />,
                }}
            />
            <Tab.Screen
                name="Awaiting"
                component={HomeScreen}
                initialParams={{ filterStatus: 'waiting_payment' }}
                options={{
                    tabBarLabel: 'Aguardando',
                    tabBarIcon: ({ focused }) => <TabBarIcon name="time-outline" focused={focused} />,
                }}
            />
            <Tab.Screen
                name="Paid"
                component={HomeScreen}
                initialParams={{ filterStatus: 'paid' }}
                options={{
                    tabBarLabel: 'Finalizados',
                    tabBarIcon: ({ focused }) => <TabBarIcon name="checkmark-done-circle-outline" focused={focused} />,
                }}
            />
            <Tab.Screen
                name="Financial"
                component={FinancialScreen}
                options={{
                    tabBarLabel: 'Relatório',
                    tabBarIcon: ({ focused }) => <TabBarIcon name="stats-chart-outline" focused={focused} />,
                }}
            />
        </Tab.Navigator>
    );
};

const styles = StyleSheet.create({
    tabBar: {
        backgroundColor: '#FFF',
        borderTopWidth: 0,
        elevation: 20,
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -10 },
        shadowOpacity: 0.12,
        shadowRadius: 15,
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
    },
    tabBarLabel: {
        fontSize: 11,
        fontWeight: '700',
        marginTop: 4,
    },
    iconContainer: {
        width: 48,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 2,
    },
    iconActive: {
        backgroundColor: COLORS.primary,
        width: 50,
        height: 32,
    }
});
