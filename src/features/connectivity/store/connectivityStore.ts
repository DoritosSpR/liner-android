import { create } from "zustand";

export interface FailureEntry {
  at: number;
  method: string;
  path: string;
  status?: number;
  code?: string;
  latencyMs: number;
}

interface ConnectivityState {
  tripped: boolean;
  failures: FailureEntry[];
  recordFailure: (entry: Omit<FailureEntry, "at">) => void;
  reset: () => void;
}

export const useConnectivityStore = create<ConnectivityState>((set) => ({
  tripped: false,
  failures: [],

  recordFailure: (entry) => {
    const at = Date.now();
    const failures = [...set().failures, { ...entry, at }].slice(-20);
    set({ failures, tripped: failures.length >= 3 });
  },

  reset: () => set({ tripped: false, failures: [] }),
}));
