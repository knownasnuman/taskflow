
import { Redirect } from 'expo-router';
import useAuthStore from '../store/auth.store';

export default function NotFound() {
  const { isAuthenticated } = useAuthStore();

  return isAuthenticated
    ? <Redirect href="/(tabs)/projects" />
    : <Redirect href="/(auth)/login" />;
}