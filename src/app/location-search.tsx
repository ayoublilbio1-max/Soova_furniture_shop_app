import { ThemeColors } from "@/constants/colors";
import { Fonts } from "@/constants/fonts";
import { useThemeColors } from "@/hooks/use-theme-colors";
import { useProfileStore } from "@/store/profile-store";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

type CityOption = {
  city: string;
  region: string;
};

// Demo location list — key cities across USA, Canada, Europe, UK, and New Zealand.
const DEMO_CITIES: CityOption[] = [
  // USA
  { city: "New York, USA", region: "New York, United States" },
  { city: "Los Angeles, USA", region: "California, United States" },
  { city: "Chicago, USA", region: "Illinois, United States" },
  { city: "Miami, USA", region: "Florida, United States" },
  { city: "San Francisco, USA", region: "California, United States" },
  { city: "Houston, USA", region: "Texas, United States" },
  // Canada
  { city: "Toronto, Canada", region: "Ontario, Canada" },
  { city: "Vancouver, Canada", region: "British Columbia, Canada" },
  { city: "Montreal, Canada", region: "Quebec, Canada" },
  // Europe
  { city: "Paris, France", region: "Ile-de-France, France" },
  { city: "Berlin, Germany", region: "Berlin, Germany" },
  { city: "Rome, Italy", region: "Lazio, Italy" },
  { city: "Madrid, Spain", region: "Madrid, Spain" },
  { city: "Amsterdam, Netherlands", region: "North Holland, Netherlands" },
  // UK
  { city: "London, UK", region: "England, United Kingdom" },
  { city: "Manchester, UK", region: "England, United Kingdom" },
  { city: "Edinburgh, UK", region: "Scotland, United Kingdom" },
  // New Zealand
  { city: "Auckland, New Zealand", region: "Auckland, New Zealand" },
  { city: "Wellington, New Zealand", region: "Wellington, New Zealand" },
];

const DEFAULT_RECENT: CityOption = {
  city: "New York, USA",
  region: "New York, United States",
};

export default function LocationSearch() {
  const colors = useThemeColors();
  const styles = getStyles(colors);
  const params = useLocalSearchParams<{
    selected?: string;
    returnTo?: string;
  }>();
  const setProfile = useProfileStore((s) => s.setProfile);

  const [query, setQuery] = useState("");
  const [recent, setRecent] = useState<CityOption[]>(
    params.selected
      ? [{ city: params.selected, region: params.selected }]
      : [DEFAULT_RECENT],
  );

  const results = query
    ? DEMO_CITIES.filter((item) =>
        item.city.toLowerCase().includes(query.toLowerCase()),
      )
    : recent;

  const showNotFound = query.trim().length > 0 && results.length === 0;

  function selectCity(option: CityOption) {
    setProfile({ location: option.city });

    if (params.returnTo === "edit-profile") {
      router.replace("/edit-profile");
      return;
    }

    router.replace({
      pathname: "/(tabs)/home",
      params: { location: option.city },
    });
  }

  function removeRecent(city: string) {
    setRecent((prev) => prev.filter((item) => item.city !== city));
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.heading}>Enter Your Location</Text>
      </View>

      <View style={styles.searchWrapper}>
        <Ionicons
          name="location-outline"
          size={20}
          color={colors.textMuted}
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Search for your location"
          placeholderTextColor={colors.textMuted}
          value={query}
          onChangeText={setQuery}
        />
        <Ionicons name="locate-outline" size={20} color={colors.accent} />
      </View>

      <Pressable
        style={styles.currentLocationRow}
        onPress={() =>
          router.push({
            pathname: "/location-access",
            params: params.returnTo ? { returnTo: params.returnTo } : {},
          })
        }
      >
        <Ionicons name="navigate" size={20} color={colors.accent} />
        <Text style={styles.currentLocationText}>Use My Current Location</Text>
      </Pressable>

      {!query && recent.length > 0 && (
        <Text style={styles.sectionLabel}>RECENT SEARCHES</Text>
      )}

      {showNotFound ? (
        <View style={styles.notFoundBox}>
          <Ionicons
            name="alert-circle-outline"
            size={22}
            color={colors.textMuted}
          />
          <Text style={styles.notFoundTitle}>Location not available</Text>
          <Text style={styles.notFoundText}>
            This is a demo — only a limited set of cities are searchable. Try
            New York, London, Paris, or Toronto.
          </Text>
        </View>
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => item.city}
          renderItem={({ item }) => (
            <View style={styles.resultRow}>
              <Pressable
                style={styles.resultInfo}
                onPress={() => selectCity(item)}
              >
                <Ionicons name="location" size={20} color={colors.accent} />
                <View>
                  <Text style={styles.resultCity}>{item.city}</Text>
                  <Text style={styles.resultRegion}>{item.region}</Text>
                </View>
              </Pressable>
              {!query && (
                <Pressable onPress={() => removeRecent(item.city)}>
                  <Ionicons name="close" size={18} color={colors.textMuted} />
                </Pressable>
              )}
            </View>
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
      paddingHorizontal: 24,
      paddingTop: 60,
    },
    headerRow: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 24,
      gap: 16,
    },
    backButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      borderWidth: 1,
      borderColor: colors.outline,
      alignItems: "center",
      justifyContent: "center",
    },
    heading: {
      fontFamily: Fonts.bold,
      fontSize: 20,
      color: colors.textPrimary,
    },
    searchWrapper: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.cardBackground,
      borderRadius: 16,
      paddingHorizontal: 16,
      height: 56,
      marginBottom: 20,
    },
    searchIcon: {
      marginRight: 10,
    },
    searchInput: {
      flex: 1,
      fontFamily: Fonts.regular,
      fontSize: 15,
      color: colors.textPrimary,
    },
    currentLocationRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      paddingBottom: 20,
      marginBottom: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.outline,
    },
    currentLocationText: {
      fontFamily: Fonts.semiBold,
      fontSize: 15,
      color: colors.textPrimary,
    },
    sectionLabel: {
      fontFamily: Fonts.semiBold,
      fontSize: 12,
      color: colors.textMuted,
      letterSpacing: 0.5,
      marginBottom: 12,
    },
    resultRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: 12,
    },
    resultInfo: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      flex: 1,
    },
    resultCity: {
      fontFamily: Fonts.semiBold,
      fontSize: 15,
      color: colors.textPrimary,
    },
    resultRegion: {
      fontFamily: Fonts.regular,
      fontSize: 13,
      color: colors.textMuted,
    },
    notFoundBox: {
      alignItems: "center",
      justifyContent: "center",
      paddingTop: 40,
      paddingHorizontal: 20,
      gap: 8,
    },
    notFoundTitle: {
      fontFamily: Fonts.semiBold,
      fontSize: 15,
      color: colors.textPrimary,
    },
    notFoundText: {
      fontFamily: Fonts.regular,
      fontSize: 13,
      lineHeight: 19,
      color: colors.textMuted,
      textAlign: "center",
    },
  });
}
