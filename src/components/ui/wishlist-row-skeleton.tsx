// Skeletons for the Wishlist tab's two views — used while switching between
// "All items" and "My lists", since re-rendering either list is heavy
// enough to make the tap feel unresponsive without feedback.

import { Skeleton } from "@/components/ui/skeleton";
import { StyleSheet, View } from "react-native";

// --- Rows shaped like WishlistRow (image left, info right) ---
export function WishlistRowsSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <View style={styles.container}>
      {Array.from({ length: rows }).map((_, i) => (
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
              width="35%"
              height={13}
              borderRadius={4}
              style={{ marginBottom: 8 }}
            />
            <Skeleton
              width="55%"
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

// --- Cards shaped like ListCard (name, count, 3 preview thumbnails) ---
export function WishlistListsSkeleton({ cards = 3 }: { cards?: number }) {
  return (
    <View style={styles.container}>
      {Array.from({ length: cards }).map((_, i) => (
        <View key={i} style={styles.listCard}>
          <Skeleton
            width="45%"
            height={16}
            borderRadius={4}
            style={{ marginBottom: 8 }}
          />
          <Skeleton
            width="25%"
            height={12}
            borderRadius={4}
            style={{ marginBottom: 14 }}
          />
          <View style={styles.previewRow}>
            <Skeleton width={72} height={72} borderRadius={12} />
            <Skeleton width={72} height={72} borderRadius={12} />
            <Skeleton width={72} height={72} borderRadius={12} />
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
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
  listCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  previewRow: {
    flexDirection: "row",
    gap: 8,
  },
});
