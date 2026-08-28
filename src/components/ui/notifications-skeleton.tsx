// Skeleton for the Notifications screen's first paint — shaped like the
// real layout (header, date section label, a few rows) but with no store
// reads or per-row animation setup, so it's cheap to mount instantly.

import { Skeleton } from "@/components/ui/skeleton";
import { StyleSheet, View } from "react-native";

export function NotificationsSkeleton() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Skeleton width={40} height={40} borderRadius={20} />
        <Skeleton width={140} height={18} borderRadius={4} />
        <View style={{ width: 40, height: 40 }} />
      </View>

      <Skeleton
        width={70}
        height={14}
        borderRadius={4}
        style={styles.sectionLabel}
      />

      {Array.from({ length: 5 }).map((_, i) => (
        <View key={i} style={styles.row}>
          <Skeleton width={36} height={36} borderRadius={18} />
          <View style={styles.rowContent}>
            <Skeleton
              width="60%"
              height={14}
              borderRadius={4}
              style={{ marginBottom: 8 }}
            />
            <Skeleton
              width="90%"
              height={11}
              borderRadius={4}
              style={{ marginBottom: 6 }}
            />
            <Skeleton width="40%" height={10} borderRadius={4} />
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
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  sectionLabel: {
    marginBottom: 10,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
  },
  rowContent: {
    flex: 1,
  },
});
