// mobile/app/(tabs)/projects/[id].tsx
import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import useProjectStore from "../../../store/project.store";
import useTaskStore from "../../../store/task.store";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  connectSocket,
  joinProject,
  leaveProject,
  onTaskUpdated,
  offTaskUpdated,
} from "../../../services/socket";

// Görev durumları — kanban sütunları
const COLUMNS = [
  { key: "TODO", label: "📋 Yapılacak", color: "#e5e7eb" },
  { key: "IN_PROGRESS", label: "⚡ Devam Eden", color: "#dbeafe" },
  { key: "DONE", label: "✅ Tamamlandı", color: "#dcfce7" },
];

export default function ProjectDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { currentProject, getProjectById } = useProjectStore();
  const { tasks, isLoading, getTasks, createTask, updateTask, deleteTask } =
    useTaskStore();

  // Modal state'leri
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any>(null);

  // Yeni görev form state'i
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDescription, setNewTaskDescription] = useState("");
  const [newTaskPriority, setNewTaskPriority] = useState("MEDIUM");

  useEffect(() => {
    if (id) {
      getProjectById(id);
      getTasks(id);
    }
  }, [id]);

  useEffect(() => {
    if (!id) return;

    // Socket bağlan ve odaya katıl
    const setupSocket = async () => {
      await connectSocket();
      joinProject(id);

      // Başka biri görevi güncellediğinde store'u güncelle
      onTaskUpdated((updatedTask) => {
        useTaskStore.getState().updateTaskLocally(updatedTask);
      });
    };

    setupSocket();

    // Ekrandan çıkınca temizle
    return () => {
      leaveProject(id);
      offTaskUpdated();
    };
  }, [id]);
  // Görevi duruma göre filtrele — her sütun kendi görevlerini gösterir
  const getTasksByStatus = (status: string) => {
    return tasks.filter((t) => t.status === status);
  };

  const handleCreateTask = async () => {
    if (!newTaskTitle.trim()) {
      Alert.alert("Hata", "Görev başlığı zorunludur");
      return;
    }

    try {
      await createTask(id, {
        title: newTaskTitle.trim(),
        description: newTaskDescription.trim() || undefined,
        priority: newTaskPriority,
        status: "TODO",
      });

      // Formu sıfırla ve modalı kapat
      setNewTaskTitle("");
      setNewTaskDescription("");
      setNewTaskPriority("MEDIUM");
      setCreateModalVisible(false);
    } catch (error: any) {
      console.log("Create task error:", JSON.stringify(error.response?.data));
      console.log("Error message:", error.message);
      Alert.alert("Hata", "Görev oluşturulamadı");
    }
  };

  const handleStatusChange = async (taskId: string, newStatus: string) => {
    try {
      await updateTask(id, taskId, { status: newStatus as any });
    } catch (error) {
      Alert.alert("Hata", "Durum güncellenemedi");
    }
  };

  const handleDeleteTask = (taskId: string) => {
    Alert.alert("Görevi Sil", "Bu görevi silmek istediğine emin misin?", [
      { text: "İptal", style: "cancel" },
      {
        text: "Sil",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteTask(id, taskId);
            setDetailModalVisible(false);
          } catch (error) {
            Alert.alert("Hata", "Görev silinemedi");
          }
        },
      },
    ]);
  };

  // Öncelik rengi
  const getPriorityColor = (priority: string) => {
    if (priority === "HIGH") return "#ef4444";
    if (priority === "MEDIUM") return "#f59e0b";
    return "#10b981";
  };

  if (isLoading && tasks.length === 0) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backText}>← Geri</Text>
        </TouchableOpacity>
        <Text style={styles.title} numberOfLines={1}>
          {currentProject?.name}
        </Text>
        <TouchableOpacity
          style={styles.membersButton}
          onPress={() => router.push(`/(tabs)/projects/members?id=${id}`)}
        >
          <Text style={styles.membersButtonText}>👥</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setCreateModalVisible(true)}
        >
          <Text style={styles.addButtonText}>+ Görev</Text>
        </TouchableOpacity>
      </View>

      {/* Kanban Board — yatay scroll */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.board}>
          {COLUMNS.map((column) => (
            <View key={column.key} style={styles.column}>
              {/* Sütun başlığı */}
              <View
                style={[styles.columnHeader, { backgroundColor: column.color }]}
              >
                <Text style={styles.columnTitle}>{column.label}</Text>
                <Text style={styles.columnCount}>
                  {getTasksByStatus(column.key).length}
                </Text>
              </View>

              {/* Görev kartları */}
              <ScrollView style={styles.columnContent}>
                {getTasksByStatus(column.key).map((task) => (
                  <TouchableOpacity
                    key={task.id}
                    style={styles.taskCard}
                    onPress={() => {
                      setSelectedTask(task);
                      setDetailModalVisible(true);
                    }}
                  >
                    {/* Öncelik göstergesi */}
                    <View
                      style={[
                        styles.priorityBar,
                        { backgroundColor: getPriorityColor(task.priority) },
                      ]}
                    />
                    <Text style={styles.taskTitle}>{task.title}</Text>
                    {task.description && (
                      <Text style={styles.taskDescription} numberOfLines={2}>
                        {task.description}
                      </Text>
                    )}
                    {task.assignee && (
                      <Text style={styles.assignee}>
                        👤 {task.assignee.name}
                      </Text>
                    )}
                  </TouchableOpacity>
                ))}

                {/* Sütun boşsa mesaj göster */}
                {getTasksByStatus(column.key).length === 0 && (
                  <Text style={styles.emptyColumn}>Görev yok</Text>
                )}
              </ScrollView>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* ── GÖREV OLUŞTURMA MODALI ── */}
      <Modal
        visible={createModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setCreateModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Yeni Görev</Text>

            <TextInput
              style={styles.modalInput}
              placeholder="Görev başlığı *"
              value={newTaskTitle}
              onChangeText={setNewTaskTitle}
            />

            <TextInput
              style={[styles.modalInput, styles.modalTextArea]}
              placeholder="Açıklama (opsiyonel)"
              value={newTaskDescription}
              onChangeText={setNewTaskDescription}
              multiline
              textAlignVertical="top"
            />

            {/* Öncelik seçimi */}
            <Text style={styles.modalLabel}>Öncelik</Text>
            <View style={styles.priorityRow}>
              {["LOW", "MEDIUM", "HIGH"].map((p) => (
                <TouchableOpacity
                  key={p}
                  style={[
                    styles.priorityButton,
                    newTaskPriority === p && {
                      backgroundColor: getPriorityColor(p),
                    },
                  ]}
                  onPress={() => setNewTaskPriority(p)}
                >
                  <Text
                    style={[
                      styles.priorityButtonText,
                      newTaskPriority === p && { color: "#fff" },
                    ]}
                  >
                    {p}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setCreateModalVisible(false)}
              >
                <Text style={styles.cancelText}>İptal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.confirmButton}
                onPress={handleCreateTask}
              >
                <Text style={styles.confirmText}>Oluştur</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ── GÖREV DETAY MODALI ── */}
      <Modal
        visible={detailModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setDetailModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{selectedTask?.title}</Text>

            {selectedTask?.description && (
              <Text style={styles.detailDescription}>
                {selectedTask.description}
              </Text>
            )}

            <Text style={styles.modalLabel}>Durum Değiştir</Text>
            <View style={styles.statusRow}>
              {COLUMNS.map((col) => (
                <TouchableOpacity
                  key={col.key}
                  style={[
                    styles.statusButton,
                    selectedTask?.status === col.key &&
                      styles.statusButtonActive,
                  ]}
                  onPress={() => {
                    handleStatusChange(selectedTask.id, col.key);
                    setSelectedTask({ ...selectedTask, status: col.key });
                  }}
                >
                  <Text style={styles.statusButtonText}>{col.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleDeleteTask(selectedTask?.id)}
              >
                <Text style={styles.deleteText}>Sil</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setDetailModalVisible(false)}
              >
                <Text style={styles.cancelText}>Kapat</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9fafb" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  backText: { color: "#6366f1", fontSize: 16 },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
    flex: 1,
    marginHorizontal: 8,
  },
  addButton: {
    backgroundColor: "#6366f1",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  addButtonText: { color: "#fff", fontWeight: "600" },
  board: { flexDirection: "row", padding: 16, gap: 12 },
  column: {
    width: 280,
    backgroundColor: "#fff",
    borderRadius: 12,
    overflow: "hidden",
  },
  columnHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
  },
  columnTitle: { fontWeight: "600", fontSize: 14, color: "#374151" },
  columnCount: {
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    fontSize: 12,
    fontWeight: "600",
    color: "#6b7280",
  },
  columnContent: { padding: 8, maxHeight: 500 },
  taskCard: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  priorityBar: { height: 3, borderRadius: 2, marginBottom: 8 },
  taskTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
  },
  taskDescription: { fontSize: 12, color: "#6b7280", marginBottom: 6 },
  assignee: { fontSize: 11, color: "#9ca3af" },
  emptyColumn: {
    textAlign: "center",
    color: "#9ca3af",
    fontSize: 13,
    padding: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    gap: 12,
  },
  modalTitle: { fontSize: 20, fontWeight: "bold", color: "#111827" },
  modalLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginTop: 4,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  modalTextArea: { height: 80, textAlignVertical: "top" },
  priorityRow: { flexDirection: "row", gap: 8 },
  priorityButton: {
    flex: 1,
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    alignItems: "center",
  },
  priorityButtonText: { fontSize: 12, fontWeight: "600", color: "#374151" },
  statusRow: { gap: 8 },
  statusButton: {
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    alignItems: "center",
  },
  statusButtonActive: { backgroundColor: "#6366f1", borderColor: "#6366f1" },
  statusButtonText: { fontSize: 13, fontWeight: "600", color: "#374151" },
  modalButtons: { flexDirection: "row", gap: 12, marginTop: 8 },
  cancelButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    alignItems: "center",
  },
  cancelText: { color: "#374151", fontWeight: "600" },
  confirmButton: {
    flex: 1,
    backgroundColor: "#6366f1",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  confirmText: { color: "#fff", fontWeight: "600" },
  deleteButton: {
    flex: 1,
    backgroundColor: "#fee2e2",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  deleteText: { color: "#ef4444", fontWeight: "600" },
  detailDescription: { color: "#6b7280", fontSize: 14 },
  membersButton: {
    backgroundColor: "#e0e7ff",
    padding: 8,
    borderRadius: 8,
    marginRight: 8,
  },
  membersButtonText: { fontSize: 16 },
});
