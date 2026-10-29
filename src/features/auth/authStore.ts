import { create } from "zustand";
import { api } from "@/src/api";
import {
  clearAuthSession,
  getAuthSession,
  setAuthSession,
  refreshAuthSession,
  type PublicUser,
} from "@/src/api";
import { playerEngine } from "@/src/features/player/playerEngine";

export type AuthStatus = "initializing" | "authenticated" | "anonymous";
export type AuthState = {
  status: AuthStatus;
  user: PublicUser | null;
  initialize: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (
    email: string,
    password: string,
    username: string,
    displayName: string,
  ) => Promise<void>;
  logout: () => Promise<void>;
};

export const useAuthStore = create<AuthState>((set) => ({
  status: "initializing",
  user: null,
  initialize: async () => {
    const stored = await getAuthSession();
    if (!stored) {
      set({ status: "anonymous", user: null });
      return;
    }
    if (stored.user) {
      set({ status: "authenticated", user: stored.user });
    }
    try {
      const user = await api.getMe();
      const current = await getAuthSession();
      if (current) await setAuthSession({ ...current, user });
      set({ status: "authenticated", user });
    } catch {
      const current = await getAuthSession();
      if (current?.refreshToken) {
        try {
          const refreshed = await refreshAuthSession();
          if (refreshed) {
            const retryUser = await api.getMe().catch(() => null);
            const active = await getAuthSession();
            if (active) await setAuthSession({ ...active, user: retryUser ?? active.user });
            set({ status: "authenticated", user: retryUser ?? current.user ?? stored.user });
            return;
          } catch {}
        }
      }
      await clearAuthSession();
      set({ status: "anonymous", user: null });
    }
  },
  login: async (email, password) => {
    const result = await api.login(email, password);
    set({ status: "authenticated", user: result.user });
  },
  register: async (email, password, username, displayName) => {
    const result = await api.register(email, password, username, displayName);
    set({ status: "authenticated", user: result.user });
  },
  logout: async () => {
    await playerEngine.stop();
    await clearAuthSession();
    set({ status: "anonymous", user: null });
  },
}));
