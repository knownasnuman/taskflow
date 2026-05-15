import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import useProjectStore from '../../../store/project.store';

export default function EditProjectScreen() {
  const { id, name: initialName, description: initialDescription } =
    useLocalSearchParams<{
      id: string;
      name: string;
      description: string;
    }>();

  const [name, setName] = useState(initialName || '');
  const [description, setDescription] = useState(initialDescription || '');
  const [isLoading, setIsLoading] = useState(false);

  const { updateProject } = useProjectStore();

  const handleUpdate = async () => {
    if (!name.trim()) {
      Alert.alert('Hata', 'Proje adı zorunludur');
      return;
    }

    setIsLoading(true);
    try {
      await updateProject(id, {
        name: name.trim(),
        description: description.trim() || undefined,
      });

      Alert.alert('Başarılı', 'Proje güncellendi', [
        { text: 'Tamam', onPress: () => router.back() }
      ]);
    } catch (error: any) {
      const message = error.response?.data?.error || 'Proje güncellenemedi';
      Alert.alert('Hata', message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backText}>← Geri</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Projeyi Düzenle</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>Proje Adı *</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Proje adı"
            maxLength={50}
          />
          <Text style={styles.charCount}>{name.length}/50</Text>

          <Text style={styles.label}>Açıklama</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            placeholder="Açıklama (opsiyonel)"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            maxLength={200}
          />
          <Text style={styles.charCount}>{description.length}/200</Text>

          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleUpdate}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Güncelle</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  header: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    gap: 8,
  },
  backText: { color: '#6366f1', fontSize: 16 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#111827' },
  form: { padding: 16, gap: 4 },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#111827',
  },
  textArea: { height: 120 },
  charCount: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'right',
    marginTop: 4,
  },
  button: {
    backgroundColor: '#6366f1',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 24,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});