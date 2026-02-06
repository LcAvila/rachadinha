import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppNavigator } from './src/presentation/navigation/AppNavigator';
import React, { useState, useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as SplashScreen from 'expo-splash-screen';
import { AuthRepository } from './src/infrastructure/firebase/AuthRepository';
import { Toast } from './src/presentation/components/Toast';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync().catch(() => {
  /* reloading the app might cause some errors, ignore them */
});

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

// Função auxiliar para registrar notificações
async function registerForPushNotificationsAsync() {
  let token;
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  if (finalStatus !== 'granted') {
    alert('Failed to get push token for push notification!');
    return;
  }
  token = (await Notifications.getExpoPushTokenAsync()).data;
  console.log('Expo Push Token:', token);

  return token;
}

export default function App() {
  const [expoPushToken, setExpoPushToken] = useState('');
  const [notification, setNotification] = useState<Notifications.Notification | undefined>(undefined);
  const [toast, setToast] = useState<{ visible: boolean; message: string; type: 'success' | 'error' | 'info' }>({
    visible: false,
    message: '',
    type: 'info'
  });

  const notificationListener = useRef<Notifications.Subscription>(undefined);
  const responseListener = useRef<Notifications.Subscription>(undefined);

  const authRepository = new AuthRepository();

  useEffect(() => {
    // 1. Registra e pega o token
    registerForPushNotificationsAsync().then(token => {
      setExpoPushToken(token || '');
      if (token) {
        authRepository.getCurrentUser().then(user => {
          if (user) {
            authRepository.updatePushToken(user.id, token);
          }
        });
      }
    });

    // 2. Listener para notificação recebida com app ABERTO (Foreground)
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      setNotification(notification);
      const title = notification.request.content.title || 'Nova Notificação';
      const body = notification.request.content.body || '';

      // Mostra Toast customizado
      setToast({
        visible: true,
        message: `${title}: ${body}`,
        type: 'info'
      });
    });

    // 3. Listener para CLIQUE na notificação (Background/Closed -> Open)
    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('User clicou na notificação:', response);
      // Aqui você pode navegar para uma tela específica baseada no response.notification.request.content.data
      // ex: navigator.navigate('Financial', { expenseId: ... })
    });

    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, []);

  return (
    <SafeAreaProvider onLayout={() => SplashScreen.hideAsync()}>
      <StatusBar style="light" translucent backgroundColor="transparent" />
      <AppNavigator />
      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onHide={() => setToast({ ...toast, visible: false })}
      />
    </SafeAreaProvider>
  );
}
