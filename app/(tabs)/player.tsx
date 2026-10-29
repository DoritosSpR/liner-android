import { View, Text, TouchableOpacity, Slider, StyleSheet } from "react-native";
import { useEffect, useState } from "react";
import { usePlayerStore } from "@/src/features/player/playerStore";
import { playerEngine } from "@/src/features/player/playerEngine";

export default function PlayerScreen() {
  const state = usePlayerStore.getState();
  const [position, setPosition] = useState(state.positionMs);

  useEffect(() => {
    const sub = usePlayerStore.subscribe((s) => setPosition(s.positionMs));
    return () => sub();
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: "#121212" }}>
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <View style={{ width: 160, height: 160, backgroundColor: "#333", borderRadius: 20, marginBottom: 24 }} />
        <Text style={{ color: "#fff", fontSize: 20, fontWeight: "bold", marginBottom: 4 }}>
          {state.currentTrack?.title ?? "Sin título"}
        </Text>
        <Text style={{ color: "#888", fontSize: 14, marginBottom: 32 }}>
          {state.currentTrack?.artists.map((a) => a.name).join(", ") ?? ""}
        </Text>
        <Slider
          style={{ width: 280 }}
          minimumValue={0}
          maximumValue={state.durationMs > 0 ? state.durationMs : 100}
          value={position}
          onValueChange={setPosition}
          onSlidingComplete={(v) => void playerEngine.seek(Math.round(v))}
          minimumTrackTintColor="#1db954"
          maximumTrackTintColor="#333"
        />
        <View style={{ flexDirection: "row", alignItems: "center", marginTop: 32 }}>
          <TouchableOpacity onPress={() => void playerEngine.pause()}>
            <Text style={{ color: "#fff", fontSize: 30 }}>⏸</Text>
          </TouchableOpacity>
          <TouchableOpacity style={{ marginHorizontal: 24 }} onPress={() => void playerEngine.setVolume(Math.min(1, state.volume + 0.1))}>
            <Text style={{ color: "#fff", fontSize: 20 }}>🔊</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => void playerEngine.setVolume(Math.max(0, state.volume - 0.1))}>
            <Text style={{ color: "#fff", fontSize: 20 }}>🔈</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
