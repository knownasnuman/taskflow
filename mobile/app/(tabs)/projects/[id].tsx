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
  RefreshControl,
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
import api from "../../../services/api";
import DateTimePicker from "@react-native-community/datetimepicker";
import { TaskSkeleton } from "../../../components/SkeletonCard";
import { Colors } from "../../../constants/colors";
import useAuthStore from "../../../store/auth.store";

// Görev durumları — kanban sütunları
const COLUMNS = [
  { key: "TODO", label: "📋 Yapılacak", color: Colors.border },
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

  const [newTaskAssigneeId, setNewTaskAssigneeId] = useState<string | null>(
    null,
  );
  const [members, setMembers] = useState<any[]>([]);

  const [newTaskDueDate, setNewTaskDueDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const { user } = useAuthStore();

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

  useEffect(() => {
    if (!id) return;

    // Proje üyelerini çek — assignee seçimi için
    const fetchMembers = async () => {
      try {
        const response = await api.get(`/api/projects/${id}`);
        setMembers(response.data.project.members);
      } catch (error) {
        console.log("Üyeler getirilemedi:", error);
      }
    };

    fetchMembers();
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
        assigneeId: newTaskAssigneeId || undefined,
        dueDate: newTaskDueDate ? newTaskDueDate.toISOString() : undefined,
      });

      // Formu sıfırla ve modalı kapat
      setNewTaskTitle("");
      setNewTaskDescription("");
      setNewTaskPriority("MEDIUM");
      setNewTaskAssigneeId(null);
      setCreateModalVisible(false);
      setNewTaskDueDate(null);
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
    if (priority === "HIGH") return Colors.danger;
    if (priority === "MEDIUM") return "#f59e0b";
    return "#10b981";
  };

  if (isLoading && tasks.length === 0) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
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
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={() => {
              getProjectById(id);
              getTasks(id);
            }}
            colors={[Colors.primary]}
          />
        }
      >
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
                    {task.dueDate && (
                      <Text style={styles.dueDate}>
                        📅 {new Date(task.dueDate).toLocaleDateString("tr-TR")}
                      </Text>
                    )}
                  </TouchableOpacity>
                ))}

                {/* Due Date */}
                <Text style={styles.modalLabel}>Bitiş Tarihi</Text>
                <TouchableOpacity
                  style={styles.dateButton}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Text style={styles.dateButtonText}>
                    {newTaskDueDate
                      ? newTaskDueDate.toLocaleDateString("tr-TR")
                      : "Tarih seç"}
                  </Text>
                </TouchableOpacity>

                {/* Seçilen tarihi temizle */}
                {newTaskDueDate && (
                  <TouchableOpacity onPress={() => setNewTaskDueDate(null)}>
                    <Text style={styles.clearDate}>Tarihi Temizle</Text>
                  </TouchableOpacity>
                )}

                {showDatePicker && (
                  <DateTimePicker
                    value={newTaskDueDate || new Date()}
                    mode="date"
                    minimumDate={new Date()} // Geçmiş tarih seçilemesin
                    onChange={(event, date) => {
                      setShowDatePicker(false);
                      if (event.type === "set" && date) {
                        setNewTaskDueDate(date);
                      }
                    }}
                  />
                )}

                {/* Sütun boşsa mesaj göster */}
                {getTasksByStatus(column.key).length === 0 && isLoading ? (
                  <>
                    <TaskSkeleton />
                    <TaskSkeleton />
                  </>
                ) : getTasksByStatus(column.key).length === 0 ? (
                  <Text style={styles.emptyColumn}>Görev yok</Text>
                ) : null}
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
                      newTaskPriority === p && { color: Colors.surface },
                    ]}
                  >
                    {p}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Assignee Seçimi */}
            <Text style={styles.modalLabel}>Atanacak Kişi</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.assigneeRow}>
                {/* Kimseye atama seçeneği */}
                <TouchableOpacity
                  style={[
                    styles.assigneeButton,
                    !newTaskAssigneeId && styles.assigneeButtonActive,
                  ]}
                  onPress={() => setNewTaskAssigneeId(null)}
                >
                  <Text style={styles.assigneeText}>Yok</Text>
                </TouchableOpacity>

                {members.map((member) => (
                  <TouchableOpacity
                    key={member.user.id}
                    style={[
                      styles.assigneeButton,
                      newTaskAssigneeId === member.user.id &&
                        styles.assigneeButtonActive,
                    ]}
                    onPress={() => setNewTaskAssigneeId(member.user.id)}
                  >
                    <Text
                      style={[
                        styles.assigneeText,
                        newTaskAssigneeId === member.user.id && {
                          color: Colors.surface,
                        },
                      ]}
                    >
                      {member.user.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

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

            {selectedTask?.assignee?.id === user?.id ? (
              <>
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
              </>
            ) : (
              <Text style={styles.noPermissionText}>
                Durumu sadece atanan kişi değiştirebilir
              </Text>
            )}

            <View style={styles.modalButtons}>
              {selectedTask?.createdBy?.id === user?.id && (
                <>
                  <TouchableOpacity
                    style={styles.editButton}
                    onPress={() => {
                      setDetailModalVisible(false);
                      router.push({
                        pathname: "/(tabs)/projects/edit-task",
                        params: {
                          projectId: id,
                          taskId: selectedTask.id,
                          title: selectedTask.title,
                          description: selectedTask.description || "",
                          priority: selectedTask.priority,
                          status: selectedTask.status,
                          assigneeId: selectedTask.assignee?.id || "",
                          dueDate: selectedTask.dueDate || "",
                        },
                      });
                    }}
                  >
                    <Text style={styles.editText}>Düzenle</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDeleteTask(selectedTask?.id)}
                  >
                    <Text style={styles.deleteText}>Sil</Text>
                  </TouchableOpacity>
                </>
              )}

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
  noPermissionText: {
  color: Colors.textMuted,
  fontSize: 13,
  fontStyle: 'italic',
  paddingVertical: 8,
  },
  container: { flex: 1, backgroundColor: Colors.background },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backText: { color: Colors.primary, fontSize: 16 },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.textPrimary,
    flex: 1,
    marginHorizontal: 8,
    textAlign: "left",
  },
  addButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  addButtonText: { color: Colors.surface, fontWeight: "600" },
  board: { flexDirection: "row", padding: 16, gap: 12 },
  column: {
    width: 280,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    overflow: "hidden",
  },
  columnHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
  },
  columnTitle: { fontWeight: "600", fontSize: 14, color: Colors.textLabel },
  columnCount: {
    backgroundColor: Colors.surface,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    fontSize: 12,
    fontWeight: "600",
    color: Colors.textSecondary,
  },
  columnContent: { padding: 8, maxHeight: 500 },
  taskCard: {
    backgroundColor: Colors.surface,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.border,
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
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  taskDescription: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 6,
  },
  assignee: { fontSize: 11, color: Colors.textMuted },
  emptyColumn: {
    textAlign: "center",
    color: Colors.textMuted,
    fontSize: 13,
    padding: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    gap: 12,
  },
  modalTitle: { fontSize: 20, fontWeight: "bold", color: Colors.textPrimary },
  modalLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.textLabel,
    marginTop: 4,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: Colors.border,
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
    borderColor: Colors.border,
    alignItems: "center",
  },
  priorityButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.textLabel,
  },
  statusRow: { gap: 8 },
  statusButton: {
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: "center",
  },
  statusButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  statusButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.textLabel,
  },
  modalButtons: { flexDirection: "row", gap: 12, marginTop: 8 },
  cancelButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: "center",
  },
  cancelText: { color: Colors.textLabel, fontWeight: "600" },
  confirmButton: {
    flex: 1,
    backgroundColor: Colors.primary,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  confirmText: { color: Colors.surface, fontWeight: "600" },
  deleteButton: {
    flex: 1,
    backgroundColor: Colors.dangerLight,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  deleteText: { color: Colors.danger, fontWeight: "600" },
  detailDescription: { color: Colors.textSecondary, fontSize: 14 },
  membersButton: {
    backgroundColor: Colors.primaryMuted,
    padding: 8,
    borderRadius: 8,
    marginRight: 8,
  },
  membersButtonText: { fontSize: 16 },
  editButton: {
    flex: 1,
    backgroundColor: Colors.primaryMuted,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  editText: { color: Colors.primary, fontWeight: "600" },
  assigneeRow: {
    flexDirection: "row",
    gap: 8,
    paddingVertical: 4,
  },
  assigneeButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  assigneeButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  assigneeText: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.textLabel,
  },
  dateButton: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: 12,
    backgroundColor: Colors.surface,
  },
  dateButtonText: {
    fontSize: 15,
    color: Colors.textLabel,
  },
  clearDate: {
    color: Colors.danger,
    fontSize: 13,
    textAlign: "right",
    marginTop: 4,
  },
  dueDate: {
    fontSize: 11,
    color: Colors.primary,
    marginTop: 4,
  },
});
