// src/store/profile-store.ts — persisted user profile data (name, avatar, phone,
// gender, email, location). Populated from complete-profile.tsx, location-access.tsx /
// location-search.tsx, and editable later from the account "Your profile" screen.

import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type ProfileState = {
  hasHydrated: boolean;
  name: string;
  email: string;
  avatarUri: string | null;
  phone: string;
  countryIsoCode: string;
  countryDialCode: string;
  gender: string | null;
  location: string | null;
  onboardingComplete: boolean;

  setHasHydrated: (value: boolean) => void;
  setProfile: (
    data: Partial<
      Omit<
        ProfileState,
        | "hasHydrated"
        | "setHasHydrated"
        | "setProfile"
        | "resetProfile"
        | "setOnboardingComplete"
      >
    >,
  ) => void;
  resetProfile: () => void;
  setOnboardingComplete: (value: boolean) => void;
};

const DEFAULT_PROFILE = {
  name: "John Doe",
  email: "demo@gmail.com",
  avatarUri: null,
  phone: "",
  countryIsoCode: "US",
  countryDialCode: "+1",
  gender: null,
  location: null,
  onboardingComplete: false,
};

export const useProfileStore = create<ProfileState>()(
  persist(
    (set) => ({
      hasHydrated: false,
      ...DEFAULT_PROFILE,

      setHasHydrated: (value) => set({ hasHydrated: value }),
      setProfile: (data) => set((state) => ({ ...state, ...data })),

      // --- Used by Settings > "Delete Account". Restores identity fields
      // to the same defaults a fresh install starts with.
      resetProfile: () => set({ ...DEFAULT_PROFILE }),

      // --- Marks the one-time onboarding flow (Welcome > Sign In/Up >
      // Complete Profile > Location) as done. Set true once Home is first
      // reached; set false on logout so a future cold start shows the
      // flow again instead of jumping straight past it.
      setOnboardingComplete: (value) => set({ onboardingComplete: value }),
    }),
    {
      name: "soova-profile-storage",
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);
