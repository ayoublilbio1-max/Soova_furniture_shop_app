// Derived helpers for product badges and category grouping, kept separate
// from products.ts so that file doesn't need to be resent whenever this
// logic changes.

import { Product, products } from "./products";

// The three sofa subtypes are stored as distinct categories in the data
// (matching the real bucket structure), but the app's single "Sofa" category
// tile/filter should treat them as one group.
export const SOFA_SUBTYPE_CATEGORIES = [
  "one_seater_sofa",
  "two_seater_sofa",
  "three_seater_sofa",
];

export function matchesCategoryFilter(
  productCategory: string,
  filterCategoryId: string,
) {
  if (filterCategoryId === "sofa") {
    return SOFA_SUBTYPE_CATEGORIES.includes(productCategory);
  }
  return productCategory === filterCategoryId;
}

// Top 3 products per real category (by salesCount) — used for the "Best
// Seller" badge on product cards outside the dedicated Best Sellers screen,
// where every card shows the badge unconditionally instead.
function computeBestSellerIds(items: Product[]): Set<string> {
  const byCategory = new Map<string, Product[]>();
  for (const item of items) {
    const list = byCategory.get(item.category) ?? [];
    list.push(item);
    byCategory.set(item.category, list);
  }

  const ids = new Set<string>();
  for (const list of byCategory.values()) {
    const top3 = [...list]
      .sort((a, b) => b.salesCount - a.salesCount)
      .slice(0, 3);
    for (const item of top3) {
      ids.add(item.id);
    }
  }
  return ids;
}

export const bestSellerIds = computeBestSellerIds(products);
