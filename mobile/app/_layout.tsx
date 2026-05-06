import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import useAuthStore from '../store/auth.store';

export default function RootLayout() {
  const { loadToken } = useAuthStore();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const init = async () => {
      await loadToken();
      setIsReady(true);
    };
    init();
  }, []);

  if (!isReady) return null;

  return <Stack screenOptions={{ headerShown: false }} />;
}