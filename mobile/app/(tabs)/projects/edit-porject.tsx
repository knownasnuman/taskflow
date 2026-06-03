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
import { Colors } from '../../../constants/colors';
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
            <Text style={styles.backText}>‹</Text>
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
              <ActivityIndicator color={Colors.surface} />
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
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    backgroundColor: Colors.surface,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: 8,
  },
  backText: { color: Colors.primary, fontSize: 16 },
  title: { fontSize: 24, fontWeight: 'bold', color: Colors.textPrimary },
  form: { padding: 16, gap: 4 },
  label: {
    fontSize: 28,
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
  textArea: { height: 120 },
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
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: Colors.surface, fontSize: 16, fontWeight: '600' },
});