// src/components/ui/network-status-banner.tsx — non-blocking connectivity
// banner shown app-wide (mounted once in the root layout). Slides in with
// "No internet connection" while offline; on reconnect, briefly shows
// "Back online" then hides itself. Almost everything in Soova works fully
// offline — all product/cart/wishlist/coupon data is local — only remote
// product images need a connection, so this never blocks interaction
// (pointerEvents="none" — taps pass straight through to the screen below).

import { ThemeColors } from "@/constants/colors";
import { Fonts } from "@/constants/fonts";
import { useThemeColors } from "@/hooks/use-theme-colors";
import { Ionicons } from "@expo/vector-icons";
import NetInfo from "@react-native-community/netinfo";
import { useEffect, useRef, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const BACK_ONLINE_DISPLAY_MS = 2500;

export function NetworkStatusBanner() {
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  const styles = getStyles(colors, insets.top);

  const [isOffline, setIsOffline] = useState(false);
  const [showBackOnline, setShowBackOnline] = useState(false);
  const wasOfflineRef = useRef(false);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      // isConnected can briefly be null while NetInfo is still determining
      // status on app start — treat that as "assume online" rather than
      // flashing the banner every time the app launches.
      const offline = state.isConnected === false;

      if (offline) {
        wasOfflineRef.current = true;
        setIsOffline(true);
        setShowBackOnline(false);
      } else if (wasOfflineRef.current) {
        wasOfflineRef.current = false;
        setIsOffline(false);
        setShowBackOnline(true);
        setTimeout(() => setShowBackOnline(false), BACK_ONLINE_DISPLAY_MS);
      }
    });

    return () => unsubscribe();
  }, []);

  if (!isOffline && !showBackOnline) return null;

  return (
    <View style={styles.wrapper} pointerEvents="none">
      <View
        style={[
          styles.banner,
          isOffline ? styles.bannerOffline : styles.bannerOnline,
        ]}
      >
        <Ionicons
          name={isOffline ? "cloud-offline-outline" : "checkmark-circle"}
          size={18}
          color="#FFFFFF"
        />
        <Text style={styles.text}>
          {isOffline
            ? "No internet connection — images may not load"
            : "Back online"}
        </Text>
      </View>
    </View>
  );
}

function getStyles(colors: ThemeColors, topInset: number) {
  return StyleSheet.create({
    wrapper: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      zIndex: 999,
      alignItems: "center",
      paddingTop: topInset + 8,
      paddingHorizontal: 16,
    },
    banner: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      borderRadius: 14,
      paddingVertical: 10,
      paddingHorizontal: 16,
      shadowColor: "#000",
      shadowOpacity: 0.15,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 4 },
      elevation: 6,
    },
    bannerOffline: {
      backgroundColor: "#B33A3A",
    },
    bannerOnline: {
      backgroundColor: "#3FA34D",
    },
    text: {
      fontFamily: Fonts.medium,
      fontSize: 13,
      color: "#FFFFFF",
    },
  });
}
