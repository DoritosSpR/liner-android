import { usePlayerStore } from "./playerStore";
import * as ExpoAV from "expo-av";
import { linerDb } from "@/src/storage";
import { resolvePlaybackStream } from "@/src/features/player/streamResolver";
import type { Track } from "@/src/contracts/track";

let audio: ExpoAV.Audio.Sound | null = null;
let isResetting = false;
let currentTrackId: string | null = null;
let recoveryAttempts = 0;
let recoveryHoldUntilMs: number | null = null;

export const playerEngine = {
  async init(): Promise<void> {
    await ExpoAV.Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      staysActiveInBackground: true,
      interruptionModeIOS: ExpoAV.Audio.InterruptionModeIOS.DoNotMix,
      playsInSilentModeIOS: true,
      shouldDuckAndroid: true,
      interruptionModeAndroid: ExpoAV.Audio.InterruptionModeAndroid.DoNotMix,
      playThroughEarpieceAndroid: false,
    });
  },

  async loadAndPlay(track: Track, startPositionMs: number = 0): Promise<void> {
    currentTrackId = track.id;
    recoveryAttempts = 0;
    recoveryHoldUntilMs = null;

    usePlayerStore.getState().setStatus("loading");
    usePlayerStore.getState().setPosition(startPositionMs);
    usePlayerStore.getState().setCurrentTrack(track, -1);

    try {
      const cached = await linerDb.getAudio(track.id);
      if (cached) {
        const sound = new ExpoAV.Audio.Sound();
        await sound.loadAsync({ uri: cached.blobPath }, { shouldPlay: false });
        audio = sound;
        setupSoundListeners(sound);
        await sound.playAsync();
        usePlayerStore.getState().setStatus("playing");
        return;
      }

      const stream = await resolvePlaybackStream(track);
      const sound = new ExpoAV.Audio.Sound();
      await sound.loadAsync({ uri: stream.url }, { shouldPlay: false });
      audio = sound;
      setupSoundListeners(sound);
      await sound.playAsync();
      usePlayerStore.getState().setStatus("playing");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Playback failed";
      usePlayerStore.getState().setStatus("error", message);
    }
  },

  async pause(): Promise<void> {
    if (audio) {
      await audio.pauseAsync();
    }
    usePlayerStore.getState().setStatus("paused");
  },

  async resume(): Promise<void> {
    if (audio) {
      await audio.playAsync();
    }
    usePlayerStore.getState().setStatus("playing");
  },

  async stop(): Promise<void> {
    if (audio) {
      await audio.stopAsync();
      await audio.unloadAsync();
      audio = null;
    }
    currentTrackId = null;
    usePlayerStore.getState().resetPlayback();
  },

  async seek(positionMs: number): Promise<void> {
    if (audio) {
      await audio.setPositionAsync(positionMs);
    }
    usePlayerStore.getState().setPosition(positionMs),
  };

  async setVolume(volume: number): Promise<void> {
    if (audio) {
      await audio.setVolumeAsync(volume);
    }
    usePlayerStore.getState().setVolume(volume);
  },

  async setPlaybackRate(rate: number): Promise<void> {
    if (audio) {
      await audio.setRateAsync(rate);
    }
    usePlayerStore.getState().setPlaybackRate(rate);
  },

  async setPitchSemitones(semitones: number): Promise<void> {
    usePlayerStore.getState().setPitchSemitones(semitones);
  },
};

function setupSoundListeners(sound: ExpoAV.Audio.Sound): void {
  sound.setOnPlaybackStatusUpdate((status) => {
    if (status.isLoaded) {
      usePlayerStore.getState().setPosition(status.positionMillis ?? 0);
      usePlayerStore.getState().setDuration(status.durationMillis ?? 0);
    }
    if (status.didJustFinish) {
      usePlayerStore.getState().dispatch({ type: "SKIP_NEXT", isAutoEnd: true });
    }
  });
}
