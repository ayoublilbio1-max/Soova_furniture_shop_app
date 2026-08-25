import { ThemeColors } from "@/constants/colors";
import { Fonts } from "@/constants/fonts";
import { useThemeColors } from "@/hooks/use-theme-colors";
import { useNotificationsStore } from "@/store/notifications-store";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

export default function NotificationDetail() {
  const colors = useThemeColors();
  const styles = getStyles(colors);
  const params = useLocalSearchParams<{ id: string }>();

  const notification = useNotificationsStore((state) =>
    state.notifications.find((item) => item.id === params.id),
  );
  const markAsRead = useNotificationsStore((state) => state.markAsRead);
  const deleteOne = useNotificationsStore((state) => state.deleteOne);

  if (!notification) {
    return (
      <View style={styles.container}>
        <Pressable
          style={styles.backButtonStandalone}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
        </Pressable>
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>This notification was removed.</Text>
        </View>
      </View>
    );
  }

  const handleToggleRead = () => {
    markAsRead(notification.id, !notification.isRead);
  };

  const handleDelete = () => {
    deleteOne(notification.id);
    router.back();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable
          style={styles.headerIconButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
        </Pressable>
        <View style={styles.headerActions}>
          <Pressable style={styles.headerIconButton} onPress={handleToggleRead}>
            <Ionicons
              name={
                notification.isRead
                  ? "mail-unread-outline"
                  : "mail-open-outline"
              }
              size={20}
              color={colors.textPrimary}
            />
          </Pressable>
          <Pressable style={styles.headerIconButton} onPress={handleDelete}>
            <Ionicons
              name="trash-outline"
              size={20}
              color={colors.textPrimary}
            />
          </Pressable>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.iconCircle}>
          <Ionicons name={notification.icon} size={26} color={colors.accent} />
        </View>
        <Text style={styles.title}>{notification.title}</Text>
        <Text style={styles.time}>{notification.time}</Text>
        <Text style={styles.message}>{notification.message}</Text>
      </ScrollView>
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
      marginBottom: 24,
    },
    headerIconButton: {
      width: 40,
      height: 40,
      alignItems: "center",
      justifyContent: "center",
    },
    headerActions: {
      flexDirection: "row",
      gap: 4,
    },
    backButtonStandalone: {
      width: 40,
      height: 40,
      alignItems: "center",
      justifyContent: "center",
      marginLeft: 24,
      marginBottom: 12,
    },
    content: {
      paddingHorizontal: 24,
      paddingBottom: 40,
    },
    iconCircle: {
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: colors.placeholder,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 16,
    },
    title: {
      fontFamily: Fonts.bold,
      fontSize: 22,
      color: colors.textPrimary,
      marginBottom: 6,
    },
    time: {
      fontFamily: Fonts.regular,
      fontSize: 13,
      color: colors.textMuted,
      marginBottom: 20,
    },
    message: {
      fontFamily: Fonts.regular,
      fontSize: 15,
      lineHeight: 24,
      color: colors.textPrimary,
    },
    emptyState: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
    },
    emptyText: {
      fontFamily: Fonts.medium,
      fontSize: 14,
      color: colors.textMuted,
    },
  });
}
