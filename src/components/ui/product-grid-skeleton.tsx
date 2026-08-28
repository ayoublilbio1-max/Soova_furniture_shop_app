// Reusable skeleton for a 2-column product grid — used for Shop's initial
// screen load, Shop's tab switches, and (next) Best Sellers/Category Products.

import { Skeleton } from "@/components/ui/skeleton";
import { StyleSheet, View } from "react-native";

type ProductGridSkeletonProps = {
  rows?: number;
};

export function ProductGridSkeleton({ rows = 5 }: ProductGridSkeletonProps) {
  return (
    <View style={styles.grid}>
      {Array.from({ length: rows }).map((_, i) => (
        <View key={i} style={styles.row}>
          <Skeleton width="48%" height={220} borderRadius={20} />
          <Skeleton width="48%" height={220} borderRadius={20} />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    gap: 16,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
});
