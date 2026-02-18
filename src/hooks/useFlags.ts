import { create } from "zustand";
import type { FlagEntry } from "../types/flagd";
import { createDefaultFlag } from "../utils/defaults";

interface FlagsStore {
  flags: FlagEntry[];
  selectedFlagKey: string | null;
  globalMetadata: Record<string, unknown>;
  evaluators: Record<string, unknown>;

  addFlag: (key: string) => void;
  deleteFlag: (key: string) => void;
  selectFlag: (key: string | null) => void;
  updateFlag: (flag: FlagEntry) => void;
  renameFlag: (oldKey: string, newKey: string) => void;
  setAll: (state: {
    flags: FlagEntry[];
    globalMetadata: Record<string, unknown>;
    evaluators: Record<string, unknown>;
  }) => void;
  setGlobalMetadata: (metadata: Record<string, unknown>) => void;
  setEvaluators: (evaluators: Record<string, unknown>) => void;

  selectedFlag: () => FlagEntry | undefined;
}

export const useFlagStore = create<FlagsStore>((set, get) => ({
  flags: [],
  selectedFlagKey: null,
  globalMetadata: {},
  evaluators: {},

  addFlag: (key) =>
    set((s) => {
      if (s.flags.some((f) => f.key === key)) return s;
      return {
        flags: [...s.flags, createDefaultFlag(key)],
        selectedFlagKey: key,
      };
    }),

  deleteFlag: (key) =>
    set((s) => {
      const flags = s.flags.filter((f) => f.key !== key);
      return {
        flags,
        selectedFlagKey:
          s.selectedFlagKey === key ? (flags[0]?.key ?? null) : s.selectedFlagKey,
      };
    }),

  selectFlag: (key) => set({ selectedFlagKey: key }),

  updateFlag: (flag) =>
    set((s) => ({
      flags: s.flags.map((f) => (f.key === flag.key ? flag : f)),
    })),

  renameFlag: (oldKey, newKey) =>
    set((s) => ({
      flags: s.flags.map((f) => (f.key === oldKey ? { ...f, key: newKey } : f)),
      selectedFlagKey: s.selectedFlagKey === oldKey ? newKey : s.selectedFlagKey,
    })),

  setAll: ({ flags, globalMetadata, evaluators }) =>
    set({
      flags,
      globalMetadata,
      evaluators,
      selectedFlagKey: flags.length > 0 ? flags[0].key : null,
    }),

  setGlobalMetadata: (metadata) => set({ globalMetadata: metadata }),
  setEvaluators: (evaluators) => set({ evaluators }),

  selectedFlag: () => {
    const s = get();
    return s.flags.find((f) => f.key === s.selectedFlagKey);
  },
}));
