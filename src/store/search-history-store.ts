import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type RecentViewProduct = {
  id: string;
  name: string;
  category: string;
  price: number;
  thumbPath: string;
};

type SearchHistoryState = {
  recentSearches: string[];
  recentViews: RecentViewProduct[];
  addSearch: (query: string) => void;
  removeSearch: (query: string) => void;
  addView: (product: RecentViewProduct) => void;
};

const MAX_RECENT_SEARCHES = 6;
const MAX_RECENT_VIEWS = 6;

export const useSearchHistoryStore = create<SearchHistoryState>()(
  persist(
    (set) => ({
      recentSearches: [],
      recentViews: [],
      addSearch: (query) =>
        set((state) => {
          const trimmed = query.trim();
          if (!trimmed) return state;
          const withoutDuplicate = state.recentSearches.filter(
            (item) => item.toLowerCase() !== trimmed.toLowerCase(),
          );
          return {
            recentSearches: [trimmed, ...withoutDuplicate].slice(
              0,
              MAX_RECENT_SEARCHES,
            ),
          };
        }),
      removeSearch: (query) =>
        set((state) => ({
          recentSearches: state.recentSearches.filter((item) => item !== query),
        })),
      addView: (product) =>
        set((state) => {
          const withoutDuplicate = state.recentViews.filter(
            (item) => item.id !== product.id,
          );
          return {
            recentViews: [product, ...withoutDuplicate].slice(
              0,
              MAX_RECENT_VIEWS,
            ),
          };
        }),
    }),
    {
      name: "soova-search-history",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
