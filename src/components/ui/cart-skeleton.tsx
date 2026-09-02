// Skeleton for the My Cart screen — header, a few item rows, and the
// totals block pinned at the bottom.

import { Skeleton } from "@/components/ui/skeleton";
import { StyleSheet, View } from "react-native";

export function CartSkeleton() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Skeleton width={40} height={40} borderRadius={20} />
        <Skeleton width={100} height={20} borderRadius={4} />
        <View style={{ width: 40, height: 40 }} />
      </View>

      {Array.from({ length: 4 }).map((_, i) => (
        <View key={i} style={styles.row}>
          <Skeleton width={90} height={90} borderRadius={16} />
          <View style={styles.rowContent}>
            <Skeleton
              width="75%"
              height={15}
              borderRadius={4}
              style={{ marginBottom: 8 }}
            />
            <Skeleton
              width="35%"
              height={12}
              borderRadius={4}
              style={{ marginBottom: 10 }}
            />
            <Skeleton width="45%" height={16} borderRadius={4} />
          </View>
          <Skeleton width={92} height={32} borderRadius={16} />
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
    alignItems: "center",
    gap: 12,
    marginBottom: 20,
  },
  rowContent: {
    flex: 1,
  },
});
