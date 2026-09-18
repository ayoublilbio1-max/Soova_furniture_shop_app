// Skeleton for the Account tab — header title, avatar + name, and the full
// menu row list, matching account.tsx's real layout. No store reads.

import { Skeleton } from "@/components/ui/skeleton";
import { StyleSheet, View } from "react-native";

const MENU_ROW_COUNT = 9;

export function AccountSkeleton() {
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Skeleton width={80} height={20} borderRadius={4} />
      </View>

      {/* Profile avatar + name */}
      <View style={styles.profileSection}>
        <Skeleton
          width={100}
          height={100}
          borderRadius={50}
          style={{ marginBottom: 16 }}
        />
        <Skeleton width={120} height={20} borderRadius={4} />
      </View>

      {/* Menu rows */}
      <View style={styles.menuContainer}>
        {Array.from({ length: MENU_ROW_COUNT }).map((_, i) => (
          <View key={i} style={styles.menuRow}>
            <View style={styles.menuRowLeft}>
              <Skeleton width={24} height={24} borderRadius={12} />
              <Skeleton width={140} height={16} borderRadius={4} />
            </View>
            <Skeleton width={16} height={16} borderRadius={4} />
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 60,
    paddingHorizontal: 24,
  },
  header: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 28,
  },
  profileSection: {
    alignItems: "center",
    marginBottom: 32,
  },
  menuContainer: {
    gap: 16,
  },
  menuRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
  },
  menuRowLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
});
