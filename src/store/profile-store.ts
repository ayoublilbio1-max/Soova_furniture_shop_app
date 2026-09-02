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

  setHasHydrated: (value: boolean) => void;
  setProfile: (
    data: Partial<
      Omit<ProfileState, "hasHydrated" | "setHasHydrated" | "setProfile">
    >,
  ) => void;
};

export const useProfileStore = create<ProfileState>()(
  persist(
    (set) => ({
      hasHydrated: false,
      name: "John Doe",
      email: "demo@gmail.com",
      avatarUri: null,
      phone: "",
      countryIsoCode: "US",
      countryDialCode: "+1",
      gender: null,
      location: null,

      setHasHydrated: (value) => set({ hasHydrated: value }),
      setProfile: (data) => set((state) => ({ ...state, ...data })),
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
