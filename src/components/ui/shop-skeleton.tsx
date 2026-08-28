// Skeleton for the Shop screen's first paint — shaped like the real layout
// (search row, tabs, banner, coupons, product grid) but with no data logic
// or per-card animation setup, so it's cheap to mount instantly.

import { ProductGridSkeleton } from "@/components/ui/product-grid-skeleton";
import { Skeleton } from "@/components/ui/skeleton";
import { StyleSheet, View } from "react-native";

export function ShopSkeleton() {
  return (
    <View style={styles.container}>
      <View style={styles.searchRow}>
        <Skeleton height={52} borderRadius={16} style={{ flex: 1 }} />
        <Skeleton width={52} height={52} borderRadius={16} />
      </View>

      <View style={styles.tabsRow}>
        <Skeleton width={80} height={38} borderRadius={20} />
        <Skeleton width={90} height={38} borderRadius={20} />
        <Skeleton width={80} height={38} borderRadius={20} />
        <Skeleton width={90} height={38} borderRadius={20} />
      </View>

      <Skeleton height={160} borderRadius={24} style={styles.banner} />

      <View style={styles.couponsRow}>
        <Skeleton width={140} height={140} borderRadius={16} />
        <Skeleton width={140} height={140} borderRadius={16} />
        <Skeleton width={140} height={140} borderRadius={16} />
      </View>

      <ProductGridSkeleton rows={3} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
    paddingTop: 60,
  },
  searchRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 20,
  },
  tabsRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 20,
  },
  banner: {
    marginBottom: 24,
  },
  couponsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 28,
  },
});
