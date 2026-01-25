import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { HomeScreen } from '../screens/HomeScreen';
import { COLORS } from '../../core/constants/constants';
import { Ionicons } from '@expo/vector-icons';
import { View, StyleSheet } from 'react-native';

const Tab = createBottomTabNavigator();

const TabBarIcon = ({ name, focused }: { name: any; focused: boolean }) => (
    <View style={[styles.iconContainer, focused && styles.iconActive]}>
        <Ionicons name={name} size={24} color={focused ? COLORS.primary : COLORS.textSecondary} />
    </View>
);

export const MainTabNavigator = () => {
    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: false,
                tabBarStyle: styles.tabBar,
                tabBarShowLabel: true,
                tabBarActiveTintColor: COLORS.primary,
                tabBarInactiveTintColor: COLORS.textSecondary,
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
        </Tab.Navigator>
    );
};

const styles = StyleSheet.create({
    tabBar: {
        backgroundColor: '#FFF',
        borderTopWidth: 0,
        elevation: 10,
        height: 70,
        paddingBottom: 10,
        paddingTop: 10,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    iconContainer: {
        padding: 8,
        borderRadius: 20,
    },
    iconActive: {
        backgroundColor: COLORS.surfaceLight,
    }
});
