// mobile/app/(tabs)/projects/index.tsx
import { useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import useProjectStore from "../../../store/project.store";
import useAuthStore from "../../../store/auth.store";
import { ProjectSkeleton } from "../../../components/SkeletonCard";
import { Colors } from "../../../constants/colors";

export default function ProjectsScreen() {
  const { projects, isLoading, getProjects, deleteProject } = useProjectStore();
  const { user } = useAuthStore();

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

  const handleDelete = (id: string, name: string, ownerId: string) => {
    if (user?.id !== ownerId) {
      Alert.alert("Yetersiz Yetki", "Bu projeyi silme yetkiniz yok");
      return;
    }
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
            } catch {
              Alert.alert("Hata", "Proje silinemedi");
            }
          },
        },
      ]
    );
  };

  const handleEdit = (item: any) => {
    if (user?.id !== item.owner.id) {
      Alert.alert("Yetersiz Yetki", "Bu projeyi düzenleme yetkiniz yok");
      return;
    }
    router.push({
      pathname: "/(tabs)/projects/edit-project",
      params: { id: item.id, name: item.name, description: item.description || "" },
    });
  };

  const renderProject = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(`/(tabs)/projects/${item.id}`)}
      activeOpacity={0.75}
    >
      {/* Üst altın şerit */}
      <View style={styles.cardAccent} />

      <View style={styles.cardInner}>
        <View style={styles.cardHeader}>
          <Text style={styles.projectName} numberOfLines={1}>
            {item.name}
          </Text>
          <View style={styles.cardActions}>
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => handleEdit(item)}
            >
              <Text style={styles.editText}>Düzenle</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => handleDelete(item.id, item.name, item.owner.id)}
            >
              <Text style={styles.deleteText}>Sil</Text>
            </TouchableOpacity>
          </View>
        </View>

        {item.description && (
          <Text style={styles.description} numberOfLines={2}>
            {item.description}
          </Text>
        )}

        <View style={styles.divider} />

        <View style={styles.cardFooter}>
          <View style={styles.metaItem}>
            <Text style={styles.metaIcon}>👤</Text>
            <Text style={styles.meta}>{item.owner.name}</Text>
          </View>
          <View style={styles.metaItem}>
            <Text style={styles.metaIcon}>👥</Text>
            <Text style={styles.meta}>{item._count.members} üye</Text>
          </View>
          <View style={styles.metaItem}>
            <Text style={styles.metaIcon}>✦</Text>
            <Text style={styles.meta}>{item._count.tasks} görev</Text>
          </View>
        </View>
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
          <Text style={styles.emptyEmoji}>✦</Text>
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
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: Colors.textPrimary,
    letterSpacing: 0.3,
  },
  addButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: Colors.textInverse,
    fontWeight: "700",
    fontSize: 14,
    letterSpacing: 0.3,
  },
  list: {
    padding: 16,
    gap: 14,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    overflow: "hidden",
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  cardAccent: {
    height: 3,
    backgroundColor: Colors.primary,
  },
  cardInner: {
    padding: 16,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  projectName: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.textPrimary,
    flex: 1,
    marginRight: 8,
    letterSpacing: 0.2,
  },
  cardActions: {
    flexDirection: "row",
    gap: 8,
  },
  editButton: {
    backgroundColor: Colors.primaryMuted,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  editText: {
    color: Colors.primaryDark,
    fontSize: 12,
    fontWeight: "600",
  },
  deleteButton: {
    backgroundColor: Colors.dangerLight,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#F0D0D0',
  },
  deleteText: {
    color: Colors.danger,
    fontSize: 12,
    fontWeight: "600",
  },
  description: {
    color: Colors.textSecondary,
    fontSize: 13,
    marginBottom: 12,
    lineHeight: 18,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.borderLight,
    marginBottom: 10,
  },
  cardFooter: {
    flexDirection: "row",
    gap: 16,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metaIcon: {
    fontSize: 11,
    color: Colors.primary,
  },
  meta: {
    fontSize: 12,
    color: Colors.textMuted,
    fontWeight: "500",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  emptyEmoji: {
    fontSize: 56,
    color: Colors.primary,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.textPrimary,
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  emptySubText: {
    fontSize: 14,
    color: Colors.textMuted,
    textAlign: "center",
    marginBottom: 28,
    lineHeight: 20,
  },
  emptyButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 28,
    paddingVertical: 13,
    borderRadius: 10,
  },
  emptyButtonText: {
    color: Colors.textInverse,
    fontWeight: "700",
    fontSize: 15,
    letterSpacing: 0.3,
  },
});