import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, StyleSheet } from "react-native";
import { useState } from "react";
import { useAuthStore } from "@/src/features/auth/authStore";
import { router } from "expo-router";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuthStore();

  const handleLogin = async () => {
    setLoading(true);
    try {
      await login(email, password);
      router.replace("/(tabs)");
    } catch {
      alert("Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    setLoading(true);
    try {
      await register(email, password, email.split("@")[0], email.split("@")[0]);
      router.replace("/(tabs)");
    } catch {
      alert("Error al registrarse");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Liner</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Contraseña"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>{loading ? "Entrando..." : "Iniciar sesión"}</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.buttonOutline} onPress={handleRegister}>
        <Text style={styles.buttonText}>Crear cuenta</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#121212", padding: 24, justifyContent: "center" },
  title: { color: "#fff", fontSize: 32, fontWeight: "bold", marginBottom: 32, textAlign: "center" },
  input: { backgroundColor: "#1e1e1e", color: "#fff", padding: 14, borderRadius: 8, marginBottom: 12 },
  button: { backgroundColor: "#1db954", padding: 14, borderRadius: 8, alignItems: "center" },
  buttonOutline: { borderWidth: 1, borderColor: "#333", padding: 14, borderRadius: 8, alignItems: "center", marginTop: 8 },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
});
