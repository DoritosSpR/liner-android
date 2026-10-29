import { View, Text, TextInput, FlatList, TouchableOpacity, ActivityIndicator } from "react-native";
import { useState } from "react";
import { api } from "@/src/api";
import type { Track } from "@/src/contracts/track";
import { usePlayerStore } from "@/src/features/player/playerStore";

export default function SearchScreen() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Track[]>([]);
  const [loading, setLoading] = useState(false);
  const dispatch = usePlayerStore.getState().dispatch;

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    try {
      const res = await api.search(query);
      setResults(res.tracks);
    } catch {}
    setLoading(false);
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#121212" }}>
      <View style={{ padding: 16, flexDirection: "row" }}>
        <TextInput
          placeholder="Buscar música..."
          style={{
            flex: 1,
            backgroundColor: "#1e1e1e",
            color: "#fff",
            padding: 10,
            borderRadius: 8,
          }}
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={handleSearch}
        />
      </View>
      {loading ? (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" color="#1db954" />
        </View>
      ) : (
        <FlatList
          data={results}
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
      )}
    </View>
  );
}
