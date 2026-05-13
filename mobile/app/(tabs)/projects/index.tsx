// mobile/app/(tabs)/projects/index.tsx
import { useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import useProjectStore from '../../../store/project.store';

export default function ProjectsScreen() {
  const { projects, isLoading, getProjects, deleteProject } = useProjectStore();

  // Ekran açılınca projeleri çek
  useEffect(() => {
    getProjects();
  }, []);

  const handleDelete = (id: string, name: string) => {
    // Silmeden önce kullanıcıya sor
    Alert.alert(
      'Projeyi Sil',
      `"${name}" projesini silmek istediğine emin misin?`,
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteProject(id);
            } catch (error) {
              Alert.alert('Hata', 'Proje silinemedi');
            }
          }
        }
      ]
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

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Projeler</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push('/(tabs)/projects/create')}
        >
          <Text style={styles.addButtonText}>+ Yeni</Text>
        </TouchableOpacity>
      </View>

      {projects.length === 0 ? (
        // Hiç proje yoksa boş ekran göster
        <View style={styles.center}>
          <Text style={styles.emptyText}>Henüz proje yok</Text>
          <Text style={styles.emptySubText}>
            Yeni bir proje oluşturmak için + Yeni butonuna tıkla
          </Text>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  addButton: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  list: {
    padding: 16,
    gap: 12,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  projectName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
  },
  deleteButton: {
    backgroundColor: '#fee2e2',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  deleteText: {
    color: '#ef4444',
    fontSize: 12,
    fontWeight: '600',
  },
  description: {
    color: '#6b7280',
    fontSize: 14,
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    gap: 12,
  },
  meta: {
    fontSize: 12,
    color: '#9ca3af',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
    paddingHorizontal: 32,
  },
});