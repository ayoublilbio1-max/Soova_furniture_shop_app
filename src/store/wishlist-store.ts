// Global wishlist state — the "All items" set every heart icon reads from,
// plus user-created named lists that organize a subset of that set.
// Persisted so the wishlist survives app restarts.

import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type WishlistCollection = {
  id: string;
  name: string;
  productIds: string[];
};

type WishlistState = {
  wishlistedIds: Record<string, true>;
  lists: WishlistCollection[];
  // True once the persisted data has actually finished loading from
  // AsyncStorage. Screens that make "does this exist?" decisions (like the
  // list-detail screen) should wait for this before concluding something
  // is missing — otherwise a screen opened right at app start can briefly
  // see an empty store and wrongly think real data doesn't exist.
  hasHydrated: boolean;
  setHasHydrated: (value: boolean) => void;
  toggleWishlist: (productId: string) => void;
  createList: (name: string) => string;
  deleteList: (listId: string) => void;
  addToList: (listId: string, productId: string) => void;
  removeFromList: (listId: string, productId: string) => void;
};

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set) => ({
      wishlistedIds: {},
      lists: [],
      hasHydrated: false,

      setHasHydrated: (value) => set({ hasHydrated: value }),

      toggleWishlist: (productId) =>
        set((state) => {
          const next = { ...state.wishlistedIds };
          let nextLists = state.lists;

          if (next[productId]) {
            delete next[productId];
            // Un-hearting removes the product from every custom list too —
            // there's no such thing as a list item that isn't also wishlisted.
            nextLists = state.lists.map((list) => ({
              ...list,
              productIds: list.productIds.filter((id) => id !== productId),
            }));
          } else {
            next[productId] = true;
          }

          return { wishlistedIds: next, lists: nextLists };
        }),

      createList: (name) => {
        const id = `list-${Date.now()}`;
        set((state) => ({
          lists: [...state.lists, { id, name, productIds: [] }],
        }));
        return id;
      },

      deleteList: (listId) =>
        set((state) => ({
          lists: state.lists.filter((list) => list.id !== listId),
        })),

      addToList: (listId, productId) =>
        set((state) => ({
          lists: state.lists.map((list) =>
            list.id === listId && !list.productIds.includes(productId)
              ? { ...list, productIds: [...list.productIds, productId] }
              : list,
          ),
        })),

      removeFromList: (listId, productId) =>
        set((state) => ({
          lists: state.lists.map((list) =>
            list.id === listId
              ? {
                  ...list,
                  productIds: list.productIds.filter((id) => id !== productId),
                }
              : list,
          ),
        })),
    }),
    {
      name: "soova-wishlist",
      storage: createJSONStorage(() => AsyncStorage),
      // Only persist the actual data — hasHydrated/setHasHydrated are
      // runtime-only and should never be written to or read from disk.
      partialize: (state) => ({
        wishlistedIds: state.wishlistedIds,
        lists: state.lists,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);
