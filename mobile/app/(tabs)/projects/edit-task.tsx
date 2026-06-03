import { useState, useEffect } from "react";
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
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import useTaskStore from "../../../store/task.store";
import api from "../../../services/api";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Colors } from '../../../constants/colors';

export default function EditTaskScreen() {
  const {
    projectId,
    taskId,
    title: initialTitle,
    description: initialDescription,
    priority: initialPriority,
    status: initialStatus,
    assigneeId: initialAssigneeId,
    dueDate: initialDueDate,
  } = useLocalSearchParams<{
    projectId: string;
    taskId: string;
    title: string;
    description: string;
    priority: string;
    status: string;
    assigneeId: string;
    dueDate: string;
  }>();

  const [title, setTitle] = useState(initialTitle || "");
  const [description, setDescription] = useState(initialDescription || "");
  const [priority, setPriority] = useState(initialPriority || "MEDIUM");
  const [status, setStatus] = useState(initialStatus || "TODO");
  const [isLoading, setIsLoading] = useState(false);

  const { updateTask } = useTaskStore();

  const [assigneeId, setAssigneeId] = useState(initialAssigneeId || null);
  const [members, setMembers] = useState<any[]>([]);

  const [dueDate, setDueDate] = useState<Date | null>(
    initialDueDate ? new Date(initialDueDate) : null,
  );
  const [showDatePicker, setShowDatePicker] = useState(false);
  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const response = await api.get(`/api/projects/${projectId}`);
        setMembers(response.data.project.members);
      } catch (error) {
        console.log("Üyeler getirilemedi");
      }
    };
    fetchMembers();
  }, []);

  const getPriorityColor = (p: string) => {
    if (p === "HIGH") return Colors.danger;
    if (p === "MEDIUM") return Colors.primary;
    return Colors.textSecondary;
  };

  const getStatusColor = (s: string) => {
    if (s === "DONE") return "#10b981";
    if (s === "IN_PROGRESS") return Colors.primary;
    return Colors.textSecondary;
  };

  const handleUpdate = async () => {
    if (!title.trim()) {
      Alert.alert("Hata", "Görev başlığı zorunludur");
      return;
    }

    setIsLoading(true);

    try {
      await updateTask(projectId, taskId, {
        title: title.trim(),
        description: description.trim() || undefined,
        priority: priority as any,
        status: status as any,
        assigneeId: assigneeId || null,
        dueDate: dueDate ? dueDate.toISOString() : null,
      });

      Alert.alert("Başarılı", "Görev güncellendi", [
        { text: "Tamam", onPress: () => router.back() },
      ]);
    } catch (error: any) {
      const message = error.response?.data?.error || "Gorev guncellenemedi";
      Alert.alert("Hata", message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backText}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Görevi Düzenle</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>Başlık *</Text>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="Görev başlığı"
            maxLength={100}
          />

          <Text style={styles.label}>Açıklama</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            placeholder="Açıklama (opsiyonel)"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            maxLength={500}
          />

          <Text style={styles.label}>Durum</Text>
          <View style={styles.optionRow}>
            {[
              { key: "TODO", label: "📋 Yapılacak" },
              { key: "IN_PROGRESS", label: "⚡ Devam Eden" },
              { key: "DONE", label: "✅ Tamamlandı" },
            ].map((s) => (
              <TouchableOpacity
                key={s.key}
                style={[
                  styles.optionButton,
                  status === s.key && {
                    backgroundColor: getStatusColor(s.key),
                    borderColor: getStatusColor(s.key),
                  },
                ]}
                onPress={() => setStatus(s.key)}
              >
                <Text
                  style={[
                    styles.optionText,
                    status === s.key && { color: Colors.surface },
                  ]}
                >
                  {s.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Öncelik</Text>
          <View style={styles.optionRow}>
            {["LOW", "MEDIUM", "HIGH"].map((p) => (
              <TouchableOpacity
                key={p}
                style={[
                  styles.optionButton,
                  priority === p && {
                    backgroundColor: getPriorityColor(p),
                    borderColor: getPriorityColor(p),
                  },
                ]}
                onPress={() => setPriority(p)}
              >
                <Text
                  style={[
                    styles.optionText,
                    priority === p && { color: Colors.surface },
                  ]}
                >
                  {p}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.label}>Bitiş Tarihi</Text>
          <TouchableOpacity
            style={styles.input}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={{ color: Colors.textLabel, fontSize: 15 }}>
              {dueDate ? dueDate.toLocaleDateString("tr-TR") : "Tarih seç"}
            </Text>
          </TouchableOpacity>

          {dueDate && (
            <TouchableOpacity onPress={() => setDueDate(null)}>
              <Text style={styles.clearDate}>Tarihi Temizle</Text>
            </TouchableOpacity>
          )}

          {showDatePicker && (
            <DateTimePicker
              value={dueDate || new Date()}
              mode="date"
              minimumDate={new Date()}
              onChange={(event, date) => {
                setShowDatePicker(false);
                if (event.type === "set" && date) {
                  setDueDate(date);
                }
              }}
            />
          )}
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
  title: { fontSize: 24, fontWeight: "bold", color: Colors.textPrimary },
  form: { padding: 16, gap: 6 },
  label: {
    fontSize: 28,
    fontWeight: "600",
    color: Colors.textLabel,
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
  optionRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  optionButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  optionText: { fontSize: 13, fontWeight: "600", color: Colors.textLabel },
  button: {
    backgroundColor: Colors.primary,
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 24,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: Colors.surface, fontSize: 16, fontWeight: "600" },
  clearDate: {
    color: Colors.danger,
    fontSize: 13,
    textAlign: "right",
    marginTop: 4,
  },
});
