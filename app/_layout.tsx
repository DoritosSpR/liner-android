import { Stack } from "expo-router";
import { useEffect } from "react";
import { playerEngine } from "@/src/features/player";
import { useAuthStore } from "@/src/features/auth/authStore";

export default function RootLayout() {
  useEffect(() => {
    void playerEngine.init();
  }, []);

  return (
    <Stack>
      <Stack.Screen
        options={{ headerShown: false }}
        name="(tabs)"
      />
      <Stack.Screen
        options={{ headerShown: false }}
        name="login"
      />
    </Stack>
  );
}
