// mobile/app/(auth)/login.tsx
import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import useAuthStore from '../../store/auth.store';

export default function LoginScreen() {
  // Local state — sadece bu ekrana ait veriler
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Store'dan ihtiyacımız olanları alıyoruz
  const { login, isLoading } = useAuthStore();

  const handleLogin = async () => {
    // Basit validasyon
    if (!email || !password) {
      Alert.alert('Hata', 'Email ve şifre zorunludur');
      return;
    }

    try {
      // Store'daki login fonksiyonunu çağırıyoruz.
      // Başarılı olursa isAuthenticated true olur.
      await login(email, password);

      // Giriş başarılı → ana sayfaya yönlendir.
      // replace → geri tuşuyla login'e dönemesin.
      router.replace('/(tabs)');

    } catch (error: any) {
      // Axios hata nesnesinden mesajı çıkarıyoruz.
      const message = error.response?.data?.error || 'Bir hata oluştu';
      Alert.alert('Giriş Başarısız', message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>TaskFlow</Text>
      <Text style={styles.subtitle}>Hesabına giriş yap</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        // Klavyeyi email moduna alır — @ işareti kolay erişilir
        keyboardType="email-address"
        // Otomatik büyük harf kapatıyoruz
        autoCapitalize="none"
      />

      <TextInput
        style={styles.input}
        placeholder="Şifre"
        value={password}
        onChangeText={setPassword}
        // Şifreyi gizler
        secureTextEntry
      />

      <TouchableOpacity
        style={[styles.button, isLoading && styles.buttonDisabled]}
        onPress={handleLogin}
        // Yüklenirken tekrar tıklanamaz
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Giriş Yap</Text>
        )}
      </TouchableOpacity>

      {/* Register'a yönlendirme */}
      <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
        <Text style={styles.link}>
          Hesabın yok mu? <Text style={styles.linkBold}>Kayıt ol</Text>
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#6366f1',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 32,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#6366f1',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  link: {
    textAlign: 'center',
    color: '#6b7280',
    fontSize: 14,
  },
  linkBold: {
    color: '#6366f1',
    fontWeight: '600',
  },
});