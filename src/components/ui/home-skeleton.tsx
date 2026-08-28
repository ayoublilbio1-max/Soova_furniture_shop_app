// Skeleton for the Home screen's first paint — shaped like the real layout
// (header, search, banner, categories, flash sale, sort chips, product
// grid, best sellers, shipping banner) but with no data logic or
// per-card animation setup, so it's cheap to mount instantly.

import { ProductGridSkeleton } from "@/components/ui/product-grid-skeleton";
import { Skeleton } from "@/components/ui/skeleton";
import { StyleSheet, View } from "react-native";

export function HomeSkeleton() {
  return (
    <View style={styles.container}>
      {/* --- Header --- */}
      <View style={styles.headerRow}>
        <View>
          <Skeleton
            width={60}
            height={12}
            borderRadius={4}
            style={{ marginBottom: 6 }}
          />
          <Skeleton width={140} height={18} borderRadius={4} />
        </View>
        <Skeleton width={44} height={44} borderRadius={22} />
      </View>

      {/* --- Search + filter --- */}
      <View style={styles.searchRow}>
        <Skeleton height={52} borderRadius={16} style={{ flex: 1 }} />
        <Skeleton width={52} height={52} borderRadius={16} />
      </View>

      {/* --- Banner --- */}
      <Skeleton height={160} borderRadius={24} style={styles.banner} />
      <View style={styles.dotsRow}>
        <Skeleton width={18} height={6} borderRadius={3} />
        <Skeleton width={6} height={6} borderRadius={3} />
        <Skeleton width={6} height={6} borderRadius={3} />
        <Skeleton width={6} height={6} borderRadius={3} />
      </View>

      {/* --- Category shortcuts --- */}
      <Skeleton
        width={90}
        height={18}
        borderRadius={4}
        style={{ marginBottom: 16 }}
      />
      <View style={styles.categoryRow}>
        <Skeleton width={64} height={64} borderRadius={32} />
        <Skeleton width={64} height={64} borderRadius={32} />
        <Skeleton width={64} height={64} borderRadius={32} />
        <Skeleton width={64} height={64} borderRadius={32} />
      </View>

      {/* --- Flash sale + sort chips --- */}
      <View style={styles.flashSaleRow}>
        <Skeleton width={100} height={18} borderRadius={4} />
        <Skeleton width={110} height={26} borderRadius={8} />
      </View>
      <View style={styles.chipsRow}>
        <Skeleton width={60} height={40} borderRadius={20} />
        <Skeleton width={80} height={40} borderRadius={20} />
        <Skeleton width={80} height={40} borderRadius={20} />
      </View>

      {/* --- Product grid (one page) --- */}
      <ProductGridSkeleton rows={1} />

      {/* --- Best sellers --- */}
      <Skeleton
        width={110}
        height={18}
        borderRadius={4}
        style={styles.sectionSpacing}
      />
      <Skeleton height={88} borderRadius={16} style={{ marginBottom: 12 }} />
      <Skeleton height={88} borderRadius={16} style={{ marginBottom: 12 }} />
      <Skeleton height={88} borderRadius={16} style={{ marginBottom: 20 }} />

      {/* --- Shipping banner --- */}
      <Skeleton height={72} borderRadius={16} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
    paddingTop: 60,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  searchRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 20,
  },
  banner: {
    marginBottom: 12,
  },
  dotsRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
    marginBottom: 24,
  },
  categoryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 28,
  },
  flashSaleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  chipsRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 20,
  },
  sectionSpacing: {
    marginTop: 24,
    marginBottom: 16,
  },
});
