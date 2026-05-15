// mobile/app/(tabs)/projects/members.tsx
import { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import api from "../../../services/api";
import { SafeAreaView } from "react-native-safe-area-context";

export default function MembersScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("MEMBER");
  const [members, setMembers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  // Mevcut üyeleri getir
  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    setIsLoading(true);
    try {
      const response = await api.get(`/api/projects/${id}`);
      setMembers(response.data.project.members);
    } catch (error) {
      Alert.alert("Hata", "Üyeler getirilemedi");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddMember = async () => {
    if (!email.trim()) {
      Alert.alert("Hata", "Email zorunludur");
      return;
    }

    setIsAdding(true);
    try {
      await api.post(`/api/projects/${id}/members`, {
        email: email.trim(),
        role,
      });

      Alert.alert("Başarılı", "Üye eklendi");
      setEmail("");
      fetchMembers(); // Listeyi yenile
    } catch (error: any) {
      const message = error.response?.data?.error || "Üye eklenemedi";
      Alert.alert("Hata", message);
    } finally {
      setIsAdding(false);
    }
  };

  const getRoleColor = (role: string) => {
    return role === "ADMIN" ? "#6366f1" : "#6b7280";
  };

  const handleRemoveMember = (memberId: string, memberName: string) => {
    Alert.alert(
      "Üyeyi Çıkar",
      `${memberName} adlı üyeyi projeden çıkarmak istediğine emin misin?`,
      [
        { text: "İptal", style: "cancel" },
        {
          text: "Çıkar",
          style: "destructive",
          onPress: async () => {
            try {
              await api.delete(`/api/projects/${id}/members/${memberId}`);
              fetchMembers(); // Listeyi yenile
              Alert.alert("Başarılı", "Üye çıkarıldı");
            } catch (error: any) {
              const message = error.response?.data?.error || "Üye çıkarılamadı";
              Alert.alert("Hata", message);
            }
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backText}>← Geri</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Üye Yönetimi</Text>
      </View>

      {/* Üye Ekle Formu */}
      <View style={styles.form}>
        <Text style={styles.sectionTitle}>Yeni Üye Ekle</Text>

        <TextInput
          style={styles.input}
          placeholder="Email adresi"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        {/* Rol Seçimi */}
        <Text style={styles.label}>Rol</Text>
        <View style={styles.roleRow}>
          {["MEMBER", "ADMIN"].map((r) => (
            <TouchableOpacity
              key={r}
              style={[styles.roleButton, role === r && styles.roleButtonActive]}
              onPress={() => setRole(r)}
            >
              <Text
                style={[
                  styles.roleButtonText,
                  role === r && styles.roleButtonTextActive,
                ]}
              >
                {r}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={[styles.addButton, isAdding && styles.buttonDisabled]}
          onPress={handleAddMember}
          disabled={isAdding}
        >
          {isAdding ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.addButtonText}>Üye Ekle</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Mevcut Üyeler */}
      <View style={styles.membersSection}>
        <Text style={styles.sectionTitle}>Mevcut Üyeler</Text>

        {isLoading ? (
          <ActivityIndicator color="#6366f1" />
        ) : (
          <FlatList
            data={members}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.memberCard}>
                <View style={styles.memberInfo}>
                  <Text style={styles.memberName}>{item.user.name}</Text>
                  <Text style={styles.memberEmail}>{item.user.email}</Text>
                </View>
                <View style={styles.memberRight}>
                  <View
                    style={[
                      styles.roleBadge,
                      { backgroundColor: getRoleColor(item.role) },
                    ]}
                  >
                    <Text style={styles.roleBadgeText}>{item.role}</Text>
                  </View>
                  {/* Proje sahibi çıkarılamaz */}
                  {item.role !== "ADMIN" && (
                    <TouchableOpacity
                      style={styles.removeButton}
                      onPress={() =>
                        handleRemoveMember(item.user.id, item.user.name)
                      }
                    >
                      <Text style={styles.removeText}>Çıkar</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            )}
            ListEmptyComponent={
              <Text style={styles.emptyText}>Henüz üye yok</Text>
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9fafb" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  backText: { color: "#6366f1", fontSize: 16 },
  title: { fontSize: 20, fontWeight: "bold", color: "#111827" },
  form: {
    backgroundColor: "#fff",
    margin: 16,
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
  },
  roleRow: { flexDirection: "row", gap: 8 },
  roleButton: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    alignItems: "center",
  },
  roleButtonActive: {
    backgroundColor: "#6366f1",
    borderColor: "#6366f1",
  },
  roleButtonText: { fontWeight: "600", color: "#374151" },
  roleButtonTextActive: { color: "#fff" },
  addButton: {
    backgroundColor: "#6366f1",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonDisabled: { opacity: 0.6 },
  addButtonText: { color: "#fff", fontWeight: "600", fontSize: 16 },
  membersSection: { paddingHorizontal: 16 },
  memberCard: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 14,
    marginBottom: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  memberInfo: { gap: 2 },
  memberName: { fontSize: 15, fontWeight: "600", color: "#111827" },
  memberEmail: { fontSize: 13, color: "#6b7280" },
  roleBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  roleBadgeText: { color: "#fff", fontSize: 12, fontWeight: "600" },
  emptyText: { color: "#9ca3af", textAlign: "center", padding: 16 },
  memberRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  removeButton: {
    backgroundColor: "#fee2e2",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  removeText: {
    color: "#ef4444",
    fontSize: 12,
    fontWeight: "600",
  },
});
