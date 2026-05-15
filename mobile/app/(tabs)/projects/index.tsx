// mobile/app/(tabs)/projects/index.tsx
import { useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { router } from "expo-router";
import useProjectStore from "../../../store/project.store";
import { SafeAreaView } from "react-native-safe-area-context";
import { ProjectSkeleton } from '../../../components/SkeletonCard';

export default function ProjectsScreen() {
  const { projects, isLoading, getProjects, deleteProject } = useProjectStore();

  // Ekran açılınca projeleri çek
  useEffect(() => {
    const loadProjects = async () => {
      try {
        await getProjects();
      } catch (error: any) {
        Alert.alert("Hata", error.message || "Projeler yüklenemedi");
      }
    };
    loadProjects();
  }, []);

  const handleDelete = (id: string, name: string) => {
    // Silmeden önce kullanıcıya sor
    Alert.alert(
      "Projeyi Sil",
      `"${name}" projesini silmek istediğine emin misin?`,
      [
        { text: "İptal", style: "cancel" },
        {
          text: "Sil",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteProject(id);
            } catch (error) {
              Alert.alert("Hata", "Proje silinemedi");
            }
          },
        },
      ],
    );
  };

  // Her proje kartı için render fonksiyonu
  const renderProject = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.card}
      // Proje detayına git — [id].tsx açılır
      onPress={() => router.push(`/(tabs)/projects/${item.id}`)}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.projectName}>{item.name}</Text>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDelete(item.id, item.name)}
        >
          <Text style={styles.deleteText}>Sil</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() =>
            router.push({
              pathname: "/(tabs)/projects/edit-project",
              params: {
                id: item.id,
                name: item.name,
                description: item.description || "",
              },
            })
          }
        >
          <Text style={styles.editText}>Düzenle</Text>
        </TouchableOpacity>
      </View>

      {item.description && (
        <Text style={styles.description} numberOfLines={2}>
          {item.description}
        </Text>
      )}

      <View style={styles.cardFooter}>
        <Text style={styles.meta}>👤 {item.owner.name}</Text>
        <Text style={styles.meta}>👥 {item._count.members} üye</Text>
        <Text style={styles.meta}>✅ {item._count.tasks} görev</Text>
      </View>
    </TouchableOpacity>
  );

  if (isLoading && projects.length === 0) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Projeler</Text>
      </View>
      <View style={{ padding: 16 }}>
        <ProjectSkeleton />
        <ProjectSkeleton />
        <ProjectSkeleton />
      </View>
    </View>
  );
}

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Projeler</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push("/(tabs)/projects/create")}
        >
          <Text style={styles.addButtonText}>+ Yeni</Text>
        </TouchableOpacity>
      </View>

      {projects.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyEmoji}>📋</Text>
          <Text style={styles.emptyText}>Henüz proje yok</Text>
          <Text style={styles.emptySubText}>
            İlk projenizi oluşturmak için + Yeni butonuna tıklayın
          </Text>
          <TouchableOpacity
            style={styles.emptyButton}
            onPress={() => router.push("/(tabs)/projects/create")}
          >
            <Text style={styles.emptyButtonText}>+ Proje Oluştur</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={projects}
          renderItem={renderProject}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          // Aşağı çekince yenile
          onRefresh={getProjects}
          refreshing={isLoading}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#111827",
  },
  addButton: {
    backgroundColor: "#6366f1",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  list: {
    padding: 16,
    gap: 12,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  projectName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    flex: 1,
  },
  deleteButton: {
    backgroundColor: "#fee2e2",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  deleteText: {
    color: "#ef4444",
    fontSize: 12,
    fontWeight: "600",
  },
  description: {
    color: "#6b7280",
    fontSize: 14,
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: "row",
    gap: 12,
  },
  meta: {
    fontSize: 12,
    color: "#9ca3af",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#374151",
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 14,
    color: "#9ca3af",
    textAlign: "center",
    marginBottom: 24,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyButton: {
    backgroundColor: "#6366f1",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  editButton: {
    backgroundColor: "#e0e7ff",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 8,
  },
  editText: {
    color: "#6366f1",
    fontSize: 12,
    fontWeight: "600",
  },
});
