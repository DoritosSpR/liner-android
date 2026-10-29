import { View, Text, TouchableOpacity, FlatList } from "react-native";
import { usePlayerStore } from "@/src/features/player/playerStore";

export default function LibraryScreen() {
  const { currentTrack, queue } = usePlayerStore.getState();
  const dispatch = usePlayerStore.getState().dispatch;

  return (
    <View style={{ flex: 1, backgroundColor: "#121212" }}>
      <View style={{ padding: 16 }}>
        <Text style={{ color: "#fff", fontSize: 24, fontWeight: "bold" }}>Biblioteca</Text>
      </View>
      <FlatList
        data={queue}
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
            <View style={{ width: 50, height: 50, backgroundColor: currentTrack?.id === item.id ? "#1db954" : "#333", borderRadius: 8, marginRight: 12 }} />
            <Text style={{ color: "#fff", fontSize: 16 }}>{item.title}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}
