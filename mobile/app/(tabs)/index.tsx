// mobile/app/(tabs)/index.tsx
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import useAuthStore from "../../store/auth.store";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from '../../constants/colors';
export default function HomeScreen() {
  const { user, logout } = useAuthStore();

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Hoş geldin!</Text>
      <Text style={styles.name}>{user?.name}</Text>
      <Text style={styles.email}>{user?.email}</Text>

      <TouchableOpacity
        style={styles.profileButton}
        onPress={() => router.push("/(tabs)/profile")}
      >
        <Text style={styles.buttonText}>Profil →</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.projectsButton}
        onPress={() => router.push("/(tabs)/projects")}
      >
        <Text style={styles.buttonText}>Projelere Git →</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={logout}>
        <Text style={styles.buttonText}>Çıkış Yap</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.surface,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.primary,
    marginBottom: 8,
  },
  name: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginBottom: 32,
  },
  button: {
    backgroundColor: Colors.danger,
    padding: 14,
    borderRadius: 8,
    width: 200,
    alignItems: "center",
  },
  buttonText: {
    color: Colors.surface,
    fontSize: 16,
    fontWeight: "600",
  },
  projectsButton: {
    backgroundColor: Colors.primary,
    padding: 14,
    borderRadius: 8,
    width: 200,
    alignItems: "center",
    marginBottom: 12,
  },
  profileButton: {
  backgroundColor: Colors.primaryMuted,
  padding: 14,
  borderRadius: 8,
  width: 200,
  alignItems: 'center',
  marginBottom: 12,
},
});
