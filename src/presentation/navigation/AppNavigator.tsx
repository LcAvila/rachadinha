import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator, TransitionPresets } from '@react-navigation/stack';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../infrastructure/firebase/config';
import { RootStackParamList } from './types';
import { COLORS } from '../../core/constants/constants';
import { Easing } from 'react-native';

import { LoginScreen } from '../screens/LoginScreen';
import { MainTabNavigator } from './MainTabNavigator';
import { CreateExpenseScreen } from '../screens/CreateExpenseScreen';
import { AddItemsScreen } from '../screens/AddItemsScreen';
import { PendingExpensesScreen } from '../screens/PendingExpensesScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { CreateGroupScreen } from '../screens/CreateGroupScreen';
import { NotificationsScreen } from '../screens/NotificationsScreen';

import { NotificationRepository } from '../../infrastructure/firebase/NotificationRepository';
import { AuthRepository } from '../../infrastructure/firebase/AuthRepository';

// Cria a Stack Navigator tipada
const Stack = createStackNavigator<RootStackParamList>();

/**
 * Configurações de transição de tela personalizadas.
 * Define animações suaves (Slide e Opacidade) similares ao iOS.
 */
const screenOptions = {
    headerShown: false,
    ...TransitionPresets.SlideFromRightIOS,
    transitionSpec: {
        open: {
            animation: 'timing' as const,
            config: {
                duration: 300,
                easing: Easing.out(Easing.cubic),
            },
        },
        close: {
            animation: 'timing' as const,
            config: {
                duration: 250,
                easing: Easing.in(Easing.cubic),
            },
        },
    },
    // Interpolador de estilo para criar o efeito de slide com fade
    cardStyleInterpolator: ({ current, layouts }: any) => {
        return {
            cardStyle: {
                transform: [
                    {
                        translateX: current.progress.interpolate({
                            inputRange: [0, 1],
                            outputRange: [layouts.screen.width, 0],
                        }),
                    },
                ],
                opacity: current.progress.interpolate({
                    inputRange: [0, 0.5, 1],
                    outputRange: [0, 1, 1],
                }),
            },
        };
    },
};

/**
 * @component AppNavigator
 * Componente raiz de navegação da aplicação.
 * Gerencia o estado de autenticação e decide qual fluxo exibir (Login ou Principal).
 */
export const AppNavigator = () => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

    // Efeito para monitorar o estado de autenticação do Firebase
    useEffect(() => {
        const notifRepo = new NotificationRepository();
        const authRepo = new AuthRepository();

        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            setIsAuthenticated(!!user);

            if (user) {
                // Ao autenticar, registra o token de push notification
                const token = await notifRepo.registerForPushNotifications();
                if (token) {
                    await authRepo.updatePushToken(user.uid, token);
                }
            }
        });
        return unsubscribe;
    }, []);

    // Exibe nada (ou Splash Screen nativa) enquanto verifica a sessão
    if (isAuthenticated === null) {
        return null;
    }

    return (
        <NavigationContainer documentTitle={{ formatter: () => 'Rachadinha' }}>
            <Stack.Navigator screenOptions={screenOptions}>
                {!isAuthenticated ? (
                    // Fluxo de Não-Autenticado
                    <Stack.Screen
                        name="Login"
                        component={LoginScreen}
                        options={{
                            ...TransitionPresets.FadeFromBottomAndroid,
                        }}
                    />
                ) : (
                    // Fluxo Autenticado
                    <>
                        <Stack.Screen
                            name="Home"
                            component={MainTabNavigator}
                        />
                        <Stack.Screen
                            name="CreateGroup"
                            component={CreateGroupScreen}
                        />
                        <Stack.Screen
                            name="CreateExpense"
                            component={CreateExpenseScreen}
                        />
                        <Stack.Screen
                            name="AddItems"
                            component={AddItemsScreen}
                        />
                        <Stack.Screen
                            name="PendingExpenses"
                            component={PendingExpensesScreen}
                        />
                        <Stack.Screen
                            name="Profile"
                            component={ProfileScreen}
                        />
                        <Stack.Screen
                            name="Notifications"
                            component={NotificationsScreen}
                        />
                    </>
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
};
