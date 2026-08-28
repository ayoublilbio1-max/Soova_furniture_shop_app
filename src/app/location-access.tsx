import { ThemeColors } from "@/constants/colors";
import { Fonts } from "@/constants/fonts";
import { useThemeColors } from "@/hooks/use-theme-colors";
import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { router } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

export default function LocationAccess() {
  const colors = useThemeColors();
  const styles = getStyles(colors);
  const [loading, setLoading] = useState(false);

  async function handleAllowAccess() {
    setLoading(true);

    try {
      const permission = await Location.requestForegroundPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          "Permission needed",
          "Allow location access to see nearby stores and delivery options, or enter your location manually.",
        );
        return;
      }

      const position = await Location.getCurrentPositionAsync({});

      let label = "Current Location";
      try {
        const places = await Location.reverseGeocodeAsync({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        const place = places[0];
        if (place) {
          label = [place.city, place.country].filter(Boolean).join(", ");
        }
      } catch {
        // Reverse geocoding failed (e.g. slow/no network) — proceed with the
        // generic label rather than blocking the user.
      }

      router.replace({
        pathname: "/(tabs)/home",
        params: { location: label },
      });
    } catch {
      Alert.alert(
        "Couldn't get your location",
        "Please check your device's location settings and try again, or enter your location manually.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <View style={[styles.circleOutline, styles.circleTopLeft]} />
      <View style={[styles.circleOutline, styles.circleBottomRight]} />

      <View style={styles.iconWrapper}>
        <View style={styles.iconCircle}>
          <Ionicons name="location" size={48} color={colors.accent} />
        </View>
      </View>

      <Text style={styles.heading}>What is Your Location?</Text>
      <Text style={styles.subheading}>
        We use your location to show you nearby stores{"\n"}and faster delivery
        options.
      </Text>

      <Pressable
        style={styles.cta}
        onPress={handleAllowAccess}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color={colors.onAccent} />
        ) : (
          <Text style={styles.ctaText}>Allow Location Access</Text>
        )}
      </Pressable>

      <Pressable onPress={() => router.push("/location-search")}>
        <Text style={styles.manualLink}>Enter Location Manually</Text>
      </Pressable>
    </View>
  );
}

function getStyles(colors: ThemeColors) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      paddingHorizontal: 24,
      paddingTop: 100,
      alignItems: "center",
    },
    circleOutline: {
      position: "absolute",
      borderWidth: 1,
      borderColor: colors.outline,
      borderRadius: 999,
    },
    circleTopLeft: {
      width: 200,
      height: 200,
      top: -70,
      left: -90,
    },
    circleBottomRight: {
      width: 200,
      height: 200,
      bottom: -90,
      right: -90,
    },
    iconWrapper: {
      marginBottom: 40,
    },
    iconCircle: {
      width: 140,
      height: 140,
      borderRadius: 70,
      backgroundColor: colors.cardBackground,
      alignItems: "center",
      justifyContent: "center",
    },
    heading: {
      fontFamily: Fonts.bold,
      fontSize: 26,
      color: colors.textPrimary,
      textAlign: "center",
    },
    subheading: {
      fontFamily: Fonts.regular,
      fontSize: 14,
      lineHeight: 21,
      color: colors.textMuted,
      textAlign: "center",
      marginTop: 12,
      marginBottom: 48,
    },
    cta: {
      width: "100%",
      backgroundColor: colors.accent,
      borderRadius: 32,
      paddingVertical: 18,
      alignItems: "center",
      marginBottom: 20,
    },
    ctaText: {
      fontFamily: Fonts.semiBold,
      fontSize: 16,
      color: colors.onAccent,
    },
    manualLink: {
      fontFamily: Fonts.semiBold,
      fontSize: 14,
      color: colors.accent,
      textDecorationLine: "underline",
    },
  });
}
