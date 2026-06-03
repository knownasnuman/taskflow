// mobile/app/(tabs)/projects/create.tsx
import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import useProjectStore from '../../../store/project.store';
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "../../../constants/colors";

export default function CreateProjectScreen() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const { createProject, isLoading } = useProjectStore();

const handleCreate = async () => {
  if (!name.trim()) {
    Alert.alert('Hata', 'Proje adı zorunludur');
    return;
  }

  try {
    await createProject(name.trim(), description.trim() || undefined);
    // router.back() yerine direkt yönlendir
    router.push('/(tabs)/projects');
  } catch (error: any) {
    console.log('Create project error:', JSON.stringify(error.response?.data));
    console.log('Error message:', error.message);
    const message = error.response?.data?.error || 'Proje oluşturulamadı';
    Alert.alert('Hata', message);
  }
};

  return (
    // KeyboardAvoidingView — klavye açılınca input'lar yukarı kayar
    // Platform.OS — iOS ve Android farklı davranır
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backText}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Yeni Proje</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>Proje Adı *</Text>
          <TextInput
            style={styles.input}
            placeholder="örn. TaskFlow Mobile"
            value={name}
            onChangeText={setName}
            maxLength={50}
          />
          <Text style={styles.charCount}>{name.length}/50</Text>

          <Text style={styles.label}>Açıklama</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Proje hakkında kısa bir açıklama..."
            value={description}
            onChangeText={setDescription}
            multiline
            // Birden fazla satır
            numberOfLines={4}
            maxLength={200}
            textAlignVertical="top"
          />
          <Text style={styles.charCount}>{description.length}/200</Text>

          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleCreate}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={Colors.surface} />
            ) : (
              <Text style={styles.buttonText}>Proje Oluştur</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    backgroundColor: Colors.surface,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: 8,
  },
  backText: {
    color: Colors.primary,
    fontSize: 28,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  form: {
    padding: 16,
    gap: 4,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
    marginBottom: 6,
  },
  input: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: Colors.textPrimary,
  },
  textArea: {
    height: 100,
  },
  charCount: {
    fontSize: 12,
    color: Colors.textMuted,
    textAlign: 'right',
    marginTop: 4,
  },
  button: {
    backgroundColor: Colors.primary,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 24,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: Colors.surface,
    fontSize: 16,
    fontWeight: '600',
  },
});