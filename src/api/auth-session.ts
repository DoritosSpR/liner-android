import * as SecureStore from "expo-secure-store";

export const SESSION_KEY = "liner_auth_session_v1";

export interface StoredAuthSession {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAt: string;
  user: import("@/src/contracts/auth").PublicUser;
  expiresAt?: number;
}

export async function getAuthSession(): Promise<StoredAuthSession | null> {
  try {
    const raw = await SecureStore.getItemAsync(SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as StoredAuthSession;
  } catch {
    return null;
  }
}

export async function setAuthSession(session: StoredAuthSession | null): Promise<void> {
  if (session === null) {
    await SecureStore.deleteItemAsync(SESSION_KEY);
  } else {
    await SecureStore.setItemAsync(SESSION_KEY, JSON.stringify(session));
  }
}

export async function clearAuthSession(): Promise<void> {
  await SecureStore.deleteItemAsync(SESSION_KEY);
}

export function isSessionExpired(session: StoredAuthSession | null): boolean {
  if (!session) return true;
  if (session.expiresAt && Date.now() >= session.expiresAt - 60_000) return true;
  try {
    return Date.now() >= new Date(session.accessTokenExpiresAt).getTime() - 60_000;
  } catch {
    return true;
  }
}
