import * as FileSystem from "expo-file-system";

const CACHE_DIR = FileSystem.cacheDirectory + "liner/";

export async function ensureCacheDir(): Promise<string> {
  const dirInfo = await FileSystem.getInfoAsync(CACHE_DIR);
  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(CACHE_DIR, { intermediates: true });
  }
  return CACHE_DIR;
}

export async function writeAudioFile(
  trackId: string,
  base64Data: string,
): Promise<string> {
  await ensureCacheDir();
  const fileUri = `${CACHE_DIR}${trackId}.mp3`;
  await FileSystem.writeAsStringAsync(fileUri, base64Data, {
    encoding: FileSystem.EncodingType.Base64,
  });
  return fileUri;
}

export async function readAudioFile(trackId: string): Promise<string | null> {
  const fileUri = `${CACHE_DIR}${trackId}.mp3`;
  const info = await FileSystem.getInfoAsync(fileUri);
  if (!info.exists) return null;
  return fileUri;
}

export async function deleteAudioFile(trackId: string): Promise<void> {
  const fileUri = `${CACHE_DIR}${trackId}.mp3`;
  const info = await FileSystem.getInfoAsync(fileUri);
  if (info.exists) {
    await FileSystem.deleteAsync(fileUri);
  }
}

export async function listAudioFiles(): Promise<string[]> {
  await ensureCacheDir();
  try {
    const content = await FileSystem.readDirectoryAsync(CACHE_DIR);
    return content.filter((f) => f.endsWith(".mp3"));
  } catch {
    return [];
  }
}
