// Account tab — Profile screen featuring a themed empty avatar circle with an edit badge,
// device photo selection via expo-image-picker, navigation links, and logout sheet.

import { AccountSkeleton } from "@/components/ui/account-skeleton";
import { ThemeColors } from "@/constants/colors";
import { Fonts } from "@/constants/fonts";
import { useDeferredReady } from "@/hooks/use-deferred-ready";
import { useThemeColors } from "@/hooks/use-theme-colors";
import { useProfileStore } from "@/store/profile-store";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { useState } from "react";
import {
  Alert,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

type MenuItem = {
  id: string;
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  route?: string;
  action?: () => void;
  isDestructive?: boolean;
};

export default function Account() {
  const colors = useThemeColors();
  const styles = getStyles(colors);
  const ready = useDeferredReady();

  const profileName = useProfileStore((s) => s.name);
  const profileAvatarUri = useProfileStore((s) => s.avatarUri);
  const setProfile = useProfileStore((s) => s.setProfile);
  const setOnboardingComplete = useProfileStore((s) => s.setOnboardingComplete);

  const [logoutModalVisible, setLogoutModalVisible] = useState(false);

  const menuItems: MenuItem[] = [
    {
      id: "profile",
      title: "Your profile",
      icon: "person-outline",
      route: "/edit-profile",
    },
    {
      id: "address",
      title: "Manage Address",
      icon: "location-outline",
      route: "/shipping-address",
    },
    {
      id: "payment",
      title: "Payment Methods",
      icon: "card-outline",
      route: "/payment-methods?mode=manage",
    },
    {
      id: "orders",
      title: "My Orders",
      icon: "receipt-outline",
      route: "/orders",
    },
    {
      id: "coupons",
      title: "My Coupons",
      icon: "pricetag-outline",
      route: "/coupons",
    },
    {
      id: "settings",
      title: "Settings",
      icon: "settings-outline",
      route: "/settings",
    },
    {
      id: "help",
      title: "Help Center",
      icon: "help-circle-outline",
      route: "/help",
    },
    {
      id: "privacy",
      title: "Privacy Policy",
      icon: "shield-checkmark-outline",
      route: "/privacy",
    },
    {
      id: "logout",
      title: "Log out",
      icon: "log-out-outline",
      action: () => setLogoutModalVisible(true),
      isDestructive: true,
    },
  ];

  async function handlePickImage() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== "granted") {
      Alert.alert(
        "Permission Denied",
        "Permission to access photo library is required to choose a profile picture.",
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setProfile({ avatarUri: result.assets[0].uri });
    }
  }

  function handleItemPress(item: MenuItem) {
    if (item.action) {
      item.action();
      return;
    }
    if (item.route) {
      router.push(item.route as any);
    }
  }

  function handleLogout() {
    setLogoutModalVisible(false);
    // Marks onboarding as not-done, so a future cold start shows
    // Welcome/Sign In again instead of jumping straight back to Home.
    setOnboardingComplete(false);
    router.replace("/sign-in" as any);
  }

  if (!ready) {
    return (
      <View style={styles.screen}>
        <AccountSkeleton />
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profile</Text>
        </View>

        {/* Profile Avatar & Name */}
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            {profileAvatarUri ? (
              <Image
                source={{ uri: profileAvatarUri }}
                style={styles.avatarImage}
              />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Ionicons name="person" size={52} color={colors.textMuted} />
              </View>
            )}
            <Pressable
              style={styles.editAvatarButton}
              onPress={handlePickImage}
            >
              <Ionicons name="pencil" size={14} color="#FFFFFF" />
            </Pressable>
          </View>
          <Text style={styles.userName}>{profileName}</Text>
        </View>

        {/* Menu Items */}
        <View style={styles.menuContainer}>
          {menuItems.map((item) => (
            <Pressable
              key={item.id}
              style={({ pressed }) => [
                styles.menuRow,
                pressed && styles.menuRowPressed,
              ]}
              onPress={() => handleItemPress(item)}
            >
              <View style={styles.menuRowLeft}>
                <Ionicons
                  name={item.icon}
                  size={22}
                  color={
                    item.isDestructive ? colors.roseRed : colors.textPrimary
                  }
                />
                <Text
                  style={[
                    styles.menuText,
                    item.isDestructive && { color: colors.roseRed },
                  ]}
                >
                  {item.title}
                </Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={18}
                color={colors.textMuted}
              />
            </Pressable>
          ))}
        </View>
      </ScrollView>

      {/* Logout Sheet Modal */}
      <Modal
        transparent
        visible={logoutModalVisible}
        animationType="slide"
        onRequestClose={() => setLogoutModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <Pressable
            style={styles.modalBackdropTap}
            onPress={() => setLogoutModalVisible(false)}
          />
          <View style={styles.sheetCard}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>Logout</Text>
            <View style={styles.divider} />
            <Text style={styles.sheetMessage}>
              Are you sure you want to log out?
            </Text>

            <View style={styles.sheetActionsRow}>
              <Pressable
                style={styles.cancelButton}
                onPress={() => setLogoutModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </Pressable>
              <Pressable style={styles.logoutButton} onPress={handleLogout}>
                <Text style={styles.logoutButtonText}>Yes, Logout</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function getStyles(colors: ThemeColors) {
  return StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollContent: {
      paddingTop: 60,
      paddingHorizontal: 24,
      paddingBottom: 40,
    },
    header: {
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 28,
    },
    headerTitle: {
      fontFamily: Fonts.bold,
      fontSize: 18,
      color: colors.textPrimary,
    },
    profileSection: {
      alignItems: "center",
      marginBottom: 32,
    },
    avatarContainer: {
      position: "relative",
      width: 100,
      height: 100,
      marginBottom: 16,
    },
    avatarPlaceholder: {
      width: 100,
      height: 100,
      borderRadius: 50,
      backgroundColor: colors.cardBackground,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: colors.outline,
    },
    avatarImage: {
      width: 100,
      height: 100,
      borderRadius: 50,
    },
    editAvatarButton: {
      position: "absolute",
      bottom: 2,
      right: 2,
      width: 30,
      height: 30,
      borderRadius: 15,
      backgroundColor: colors.accent,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 2,
      borderColor: colors.background,
    },
    userName: {
      fontFamily: Fonts.bold,
      fontSize: 18,
      color: colors.textPrimary,
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
    menuRowPressed: {
      opacity: 0.7,
    },
    menuRowLeft: {
      flexDirection: "row",
      alignItems: "center",
      gap: 14,
    },
    menuText: {
      fontFamily: Fonts.medium,
      fontSize: 15,
      color: colors.textPrimary,
    },
    modalBackdrop: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      justifyContent: "flex-end",
    },
    modalBackdropTap: {
      flex: 1,
    },
    sheetCard: {
      backgroundColor: colors.background,
      borderTopLeftRadius: 28,
      borderTopRightRadius: 28,
      paddingHorizontal: 24,
      paddingTop: 12,
      paddingBottom: 48,
      alignItems: "center",
    },
    sheetHandle: {
      width: 40,
      height: 4,
      borderRadius: 2,
      backgroundColor: colors.outline,
      marginBottom: 16,
    },
    sheetTitle: {
      fontFamily: Fonts.bold,
      fontSize: 18,
      color: colors.roseRed,
      marginBottom: 16,
    },
    divider: {
      width: "100%",
      height: 1,
      backgroundColor: colors.outline,
      marginBottom: 20,
    },
    sheetMessage: {
      fontFamily: Fonts.medium,
      fontSize: 15,
      color: colors.textPrimary,
      textAlign: "center",
      marginBottom: 28,
    },
    sheetActionsRow: {
      flexDirection: "row",
      gap: 12,
      width: "100%",
    },
    cancelButton: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1.5,
      borderColor: colors.accent,
      borderRadius: 28,
      paddingVertical: 14,
    },
    cancelButtonText: {
      fontFamily: Fonts.semiBold,
      fontSize: 15,
      color: colors.accent,
    },
    logoutButton: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.accent,
      borderRadius: 28,
      paddingVertical: 14,
    },
    logoutButtonText: {
      fontFamily: Fonts.semiBold,
      fontSize: 15,
      color: colors.onAccent,
    },
  });
}
