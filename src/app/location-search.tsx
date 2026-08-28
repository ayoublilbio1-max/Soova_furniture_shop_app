import { ThemeColors } from "@/constants/colors";
import { Fonts } from "@/constants/fonts";
import { useThemeColors } from "@/hooks/use-theme-colors";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import {
    Alert,
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

const DEMO_CITIES: CityOption[] = [
  { city: "Casablanca, Morocco", region: "Maarif, Casablanca, Morocco" },
  { city: "Fes, Morocco", region: "Fes-Meknes, Morocco" },
  { city: "Marrakech, Morocco", region: "Marrakech-Safi, Morocco" },
  { city: "Rabat, Morocco", region: "Rabat-Sale-Kenitra, Morocco" },
  { city: "New York, USA", region: "New York, United States" },
  { city: "Paris, France", region: "Ile-de-France, France" },
];

export default function LocationSearch() {
  const colors = useThemeColors();
  const styles = getStyles(colors);
  const params = useLocalSearchParams<{ selected?: string }>();

  const [query, setQuery] = useState("");
  const [recent, setRecent] = useState<CityOption[]>(
    params.selected
      ? [{ city: params.selected, region: params.selected }]
      : [
          {
            city: "Casablanca, Morocco",
            region: "Maarif, Casablanca, Morocco",
          },
        ],
  );

  const results = query
    ? DEMO_CITIES.filter((item) =>
        item.city.toLowerCase().includes(query.toLowerCase()),
      )
    : recent;

function selectCity(option: CityOption) {
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
        onPress={() => router.push("/location-access")}
      >
        <Ionicons name="navigate" size={20} color={colors.accent} />
        <Text style={styles.currentLocationText}>Use My Current Location</Text>
      </Pressable>

      {!query && recent.length > 0 && (
        <Text style={styles.sectionLabel}>RECENT SEARCHES</Text>
      )}

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
  });
}
