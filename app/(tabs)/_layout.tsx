import { Tabs } from "expo-router";
import { useFonts } from "expo-font";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export default function TabsLayout() {
  let [loaded] = useFonts();

  if (!loaded) return null;

  return (
    <Tabs
      options={{
        tabBarActiveTintColor: "#1db954",
        tabBarInactiveTintColor: "#666666",
        headerShown: false,
      }}
    >
      <Tabs.Screen name="home" options={{ title: "Inicio", tabBarIcon: ({ focused }: any) => (
        <MaterialCommunityIcons name={focused ? "home" : "home-outline"} size={26} color={focused ? "#1db954" : "#666666"} />
      )}} />
      <Tabs.Screen name="search" options={{ title: "Buscar", tabBarIcon: ({ focused }: any) => (
        <MaterialCommunityIcons name={focused ? "magnify" : "magnify"} size={26} color={focused ? "#1db954" : "#666666"} />
      )}} />
      <Tabs.Screen name="library" options={{ title: "Biblioteca", tabBarIcon: ({ focused }: any) => (
        <MaterialCommunityIcons name={focused ? "folder-music" : "folder-music-outline"} size={26} color={focused ? "#1db954" : "#666666"} />
      )}} />
      <Tabs.Screen name="player" options={{ title: "Reproductor", tabBarIcon: ({ focused }: any) => (
        <MaterialCommunityIcons name={focused ? "play-circle" : "play-circle-outline"} size={26} color={focused ? "#1db954" : "#666666"} />
      )}} />
    </Tabs>
  );
}
