import { ThemeColors } from "@/constants/colors";
import { Fonts } from "@/constants/fonts";
import { useThemeColors } from "@/hooks/use-theme-colors";
import {
  NotificationItem,
  useNotificationsStore,
} from "@/store/notifications-store";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  FlatList,
  LayoutAnimation,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  UIManager,
  View,
} from "react-native";

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type NotificationRowProps = {
  item: NotificationItem;
  colors: ThemeColors;
  styles: ReturnType<typeof getStyles>;
  selectionMode: boolean;
  selected: boolean;
  onPress: () => void;
  onLongPress: () => void;
};

function NotificationRow({
  item,
  colors,
  styles,
  selectionMode,
  selected,
  onPress,
  onLongPress,
}: NotificationRowProps) {
  const selectedAnim = useRef(new Animated.Value(0)).current;
  const modeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(selectedAnim, {
      toValue: selected ? 1 : 0,
      duration: 200,
      easing: Easing.ease,
      useNativeDriver: false,
    }).start();
  }, [selected, selectedAnim]);

  useEffect(() => {
    Animated.timing(modeAnim, {
      toValue: selectionMode ? 1 : 0,
      duration: 200,
      easing: Easing.ease,
      useNativeDriver: true,
    }).start();
  }, [selectionMode, modeAnim]);

  return (
    <Pressable onPress={onPress} onLongPress={onLongPress}>
      <Animated.View
        style={[
          styles.row,
          {
            borderColor: selectedAnim.interpolate({
              inputRange: [0, 1],
              outputRange: ["transparent", colors.accent],
            }),
          },
        ]}
      >
        <View style={styles.leadingSlot}>
          <Animated.View
            style={[
              styles.iconCircle,
              styles.leadingAbsolute,
              {
                opacity: modeAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [1, 0],
                }),
                transform: [
                  {
                    scale: modeAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [1, 0.6],
                    }),
                  },
                ],
              },
            ]}
          >
            <Ionicons name={item.icon} size={18} color={colors.accent} />
          </Animated.View>

          <Animated.View
            style={[
              styles.checkbox,
              styles.leadingAbsolute,
              {
                opacity: modeAnim,
                transform: [
                  {
                    scale: modeAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.6, 1],
                    }),
                  },
                ],
              },
            ]}
          >
            <Animated.View
              style={[
                styles.checkboxFill,
                {
                  backgroundColor: selectedAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ["transparent", colors.accent],
                  }),
                },
              ]}
            >
              {selected && (
                <Ionicons name="checkmark" size={14} color={colors.onAccent} />
              )}
            </Animated.View>
          </Animated.View>
        </View>

        <View style={styles.rowContent}>
          <View style={styles.rowTitleLine}>
            <Text
              style={[styles.rowTitle, !item.isRead && styles.rowTitleUnread]}
            >
              {item.title}
            </Text>
            {!item.isRead && <View style={styles.unreadDot} />}
          </View>
          <Text style={styles.rowMessage} numberOfLines={2}>
            {item.message}
          </Text>
          <Text style={styles.rowTime}>{item.time}</Text>
        </View>

        {!selectionMode && (
          <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
        )}
      </Animated.View>
    </Pressable>
  );
}

export default function Notifications() {
  const colors = useThemeColors();
  const styles = getStyles(colors);

  const notifications = useNotificationsStore((state) => state.notifications);
  const markAsRead = useNotificationsStore((state) => state.markAsRead);
  const bulkMarkAsRead = useNotificationsStore((state) => state.bulkMarkAsRead);
  const bulkDelete = useNotificationsStore((state) => state.bulkDelete);

  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  function animateNext() {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  }

  function openNotification(id: string, isRead: boolean) {
    if (!isRead) {
      markAsRead(id, true);
    }
    router.push({ pathname: "/notification-detail", params: { id } });
  }

  function handleRowPress(id: string, isRead: boolean) {
    if (selectionMode) {
      toggleSelected(id);
      return;
    }
    openNotification(id, isRead);
  }

  function handleRowLongPress(id: string) {
    setSelectionMode(true);
    setSelectedIds(new Set([id]));
  }

  function toggleSelected(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      if (next.size === 0) {
        setSelectionMode(false);
      }
      return next;
    });
  }

  function exitSelectionMode() {
    setSelectionMode(false);
    setSelectedIds(new Set());
  }

  function handleBulkMarkAsRead() {
    bulkMarkAsRead(Array.from(selectedIds));
    exitSelectionMode();
  }

  function handleBulkDelete() {
    animateNext();
    bulkDelete(Array.from(selectedIds));
    exitSelectionMode();
  }

  return (
    <View style={styles.container}>
      {selectionMode ? (
        <View style={styles.selectionHeader}>
          <Pressable
            style={styles.headerIconButton}
            onPress={exitSelectionMode}
          >
            <Ionicons name="close" size={22} color={colors.textPrimary} />
          </Pressable>
          <Text style={styles.selectionCount}>{selectedIds.size} selected</Text>
          <View style={styles.selectionActions}>
            <Pressable
              style={styles.headerIconButton}
              onPress={handleBulkMarkAsRead}
            >
              <Ionicons
                name="mail-open-outline"
                size={20}
                color={colors.accent}
              />
            </Pressable>
            <Pressable
              style={styles.headerIconButton}
              onPress={handleBulkDelete}
            >
              <Ionicons name="trash-outline" size={20} color={colors.accent} />
            </Pressable>
          </View>
        </View>
      ) : (
        <View style={styles.header}>
          <Pressable
            style={styles.headerIconButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
          </Pressable>
          <Text style={styles.headerTitle}>Notifications</Text>
          <View style={styles.headerIconButton} />
        </View>
      )}

      {notifications.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons
            name="notifications-off-outline"
            size={40}
            color={colors.textMuted}
          />
          <Text style={styles.emptyText}>No notifications</Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <NotificationRow
              item={item}
              colors={colors}
              styles={styles}
              selectionMode={selectionMode}
              selected={selectedIds.has(item.id)}
              onPress={() => handleRowPress(item.id, item.isRead)}
              onLongPress={() => handleRowLongPress(item.id)}
            />
          )}
        />
      )}
    </View>
  );
}

function getStyles(colors: ThemeColors) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      paddingTop: 60,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 24,
      marginBottom: 20,
    },
    headerTitle: {
      fontFamily: Fonts.bold,
      fontSize: 18,
      color: colors.textPrimary,
    },
    headerIconButton: {
      width: 40,
      height: 40,
      alignItems: "center",
      justifyContent: "center",
    },
    selectionHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 24,
      marginBottom: 20,
    },
    selectionCount: {
      fontFamily: Fonts.semiBold,
      fontSize: 15,
      color: colors.textPrimary,
    },
    selectionActions: {
      flexDirection: "row",
      gap: 4,
    },
    listContent: {
      paddingHorizontal: 24,
      paddingBottom: 40,
    },
    row: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      backgroundColor: colors.placeholder,
      borderRadius: 16,
      borderWidth: 1.5,
      padding: 14,
      marginBottom: 12,
    },
    leadingSlot: {
      width: 36,
      height: 36,
    },
    leadingAbsolute: {
      position: "absolute",
      top: 0,
      left: 0,
    },
    checkbox: {
      width: 22,
      height: 22,
      marginTop: 7,
      marginLeft: 7,
    },
    checkboxFill: {
      flex: 1,
      borderRadius: 6,
      borderWidth: 1.5,
      borderColor: colors.accent,
      alignItems: "center",
      justifyContent: "center",
    },
    iconCircle: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: colors.background,
      alignItems: "center",
      justifyContent: "center",
    },
    rowContent: {
      flex: 1,
    },
    rowTitleLine: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      marginBottom: 3,
    },
    rowTitle: {
      fontFamily: Fonts.medium,
      fontSize: 14,
      color: colors.textPrimary,
    },
    rowTitleUnread: {
      fontFamily: Fonts.bold,
    },
    unreadDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: colors.accent,
    },
    rowMessage: {
      fontFamily: Fonts.regular,
      fontSize: 12,
      lineHeight: 17,
      color: colors.textMuted,
      marginBottom: 4,
    },
    rowTime: {
      fontFamily: Fonts.regular,
      fontSize: 11,
      color: colors.textMuted,
    },
    emptyState: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      gap: 12,
    },
    emptyText: {
      fontFamily: Fonts.medium,
      fontSize: 14,
      color: colors.textMuted,
    },
  });
}
