import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from "react-native";
import { useEffect, useState } from "react";
import { api } from "@/src/api";
import type { Track } from "@/src/contracts/track";
import { usePlayerStore } from "@/src/features/player/playerStore";

export default function HomeScreen() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const dispatch = usePlayerStore.getState().dispatch;

  useEffect(() => {
    void api.getPopularTracks("7d").then((t) => {
      setTracks(t);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#1db954" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#121212" }}>
      <View style={{ padding: 16 }}>
        <Text style={{ color: "#fff", fontSize: 24, fontWeight: "bold" }}>Popular</Text>
      </View>
      <FlatList
        data={tracks}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => void dispatch({ type: "PLAY_REQUESTED", track: item })}
            style={{
              padding: 12,
              flexDirection: "row",
              alignItems: "center",
              borderBottomWidth: 1,
              borderBottomColor: "#222",
            }}
          >
            <View style={{ width: 50, height: 50, backgroundColor: "#333", borderRadius: 8, marginRight: 12 }} />
            <Text style={{ color: "#fff", fontSize: 16 }}>{item.title}</Text>
            <Text style={{ color: "#888", fontSize: 14 }}>{item.artists.map((a) => a.name).join(", ")}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}
