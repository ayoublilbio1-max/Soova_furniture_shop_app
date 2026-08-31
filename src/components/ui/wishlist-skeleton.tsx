// Skeleton for the Wishlist screen's first paint — shaped like the real
// layout (header, tabs, a few product rows) but cheap to mount instantly.

import { Skeleton } from "@/components/ui/skeleton";
import { StyleSheet, View } from "react-native";

export function WishlistSkeleton() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Skeleton width={120} height={22} borderRadius={4} />
        <Skeleton width={40} height={40} borderRadius={20} />
      </View>

      <View style={styles.tabsRow}>
        <Skeleton width={110} height={16} borderRadius={4} />
        <Skeleton width={100} height={16} borderRadius={4} />
      </View>

      {Array.from({ length: 4 }).map((_, i) => (
        <View key={i} style={styles.row}>
          <Skeleton width={100} height={100} borderRadius={16} />
          <View style={styles.rowContent}>
            <Skeleton
              width="80%"
              height={16}
              borderRadius={4}
              style={{ marginBottom: 8 }}
            />
            <Skeleton
              width="40%"
              height={14}
              borderRadius={4}
              style={{ marginBottom: 10 }}
            />
            <Skeleton
              width="60%"
              height={16}
              borderRadius={4}
              style={{ marginBottom: 12 }}
            />
            <Skeleton height={40} borderRadius={20} />
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
    paddingTop: 60,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  tabsRow: {
    flexDirection: "row",
    gap: 24,
    marginBottom: 24,
  },
  row: {
    flexDirection: "row",
    gap: 14,
    marginBottom: 20,
  },
  rowContent: {
    flex: 1,
    justifyContent: "center",
  },
});
