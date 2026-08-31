// Skeleton for a single wishlist list's detail screen — header + a few
// product rows, no store reads.

import { Skeleton } from "@/components/ui/skeleton";
import { StyleSheet, View } from "react-native";

export function WishlistListSkeleton() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Skeleton width={40} height={40} borderRadius={20} />
        <Skeleton width={140} height={20} borderRadius={4} />
        <Skeleton width={40} height={40} borderRadius={20} />
      </View>

      {Array.from({ length: 3 }).map((_, i) => (
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
