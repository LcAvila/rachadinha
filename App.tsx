import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppNavigator } from './src/presentation/navigation/AppNavigator';
import * as Notifications from 'expo-notifications';
import * as SplashScreen from 'expo-splash-screen';

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

export default function App() {
  return (
    <SafeAreaProvider onLayout={() => SplashScreen.hideAsync()}>
      <StatusBar style="light" translucent backgroundColor="transparent" />
      <AppNavigator />
    </SafeAreaProvider>
  );
}
