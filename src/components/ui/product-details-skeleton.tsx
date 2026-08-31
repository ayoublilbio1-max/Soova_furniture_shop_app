// Skeleton for the Product Details screen's first paint.

import { Skeleton } from "@/components/ui/skeleton";
import { StyleSheet, View } from "react-native";

export function ProductDetailsSkeleton() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Skeleton width={40} height={40} borderRadius={20} />
        <Skeleton width={130} height={18} borderRadius={4} />
        <Skeleton width={40} height={40} borderRadius={20} />
      </View>

      <Skeleton height={320} borderRadius={20} style={{ marginBottom: 12 }} />
      <View style={styles.thumbRow}>
        <Skeleton width={64} height={64} borderRadius={12} />
        <Skeleton width={64} height={64} borderRadius={12} />
        <Skeleton width={64} height={64} borderRadius={12} />
        <Skeleton width={64} height={64} borderRadius={12} />
      </View>

      <Skeleton
        width="70%"
        height={22}
        borderRadius={4}
        style={{ marginBottom: 10 }}
      />
      <Skeleton
        width="40%"
        height={14}
        borderRadius={4}
        style={{ marginBottom: 20 }}
      />
      <Skeleton height={80} borderRadius={12} style={{ marginBottom: 24 }} />
      <Skeleton height={56} borderRadius={20} />
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
  thumbRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 24,
  },
});
