import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import useAuthStore from '../store/auth.store';
import { registerForPushNotificationsAsync, savePushToken } from '../services/notifications';

export default function RootLayout() {
  const { isAuthenticated, loadToken } = useAuthStore();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const init = async () => {
      await loadToken();
      setIsReady(true);
    };
    init();
  }, []);

  // Kullanıcı giriş yapınca push token al ve kaydet
  useEffect(() => {
    if (isAuthenticated) {
      registerForPushNotificationsAsync().then((token) => {
        if (token) {
          savePushToken(token);
        }
      });
    }
  }, [isAuthenticated]);

  if (!isReady) return null;

  return <Stack screenOptions={{ headerShown: false }} />;
}