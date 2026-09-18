// Notification preference toggles — persisted so they survive app restarts.
// Purely local prefs; there's no push service wired up behind them, but
// they're real state, not decoration (sub-toggles disable when the master
// switch is off, same as a real settings screen).

import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type SettingsState = {
  pushEnabled: boolean;
  orderUpdates: boolean;
  promotions: boolean;
  newArrivals: boolean;
  hasHydrated: boolean;

  setHasHydrated: (value: boolean) => void;
  setPreference: (
    key: "pushEnabled" | "orderUpdates" | "promotions" | "newArrivals",
    value: boolean,
  ) => void;
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      pushEnabled: true,
      orderUpdates: true,
      promotions: true,
      newArrivals: true,
      hasHydrated: false,

      setHasHydrated: (value) => set({ hasHydrated: value }),
      setPreference: (key, value) => set({ [key]: value }),
    }),
    {
      name: "soova-settings",
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);
