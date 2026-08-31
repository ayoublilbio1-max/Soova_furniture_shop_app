import { ThemeColors } from "@/constants/colors";
import { Fonts } from "@/constants/fonts";
import { useThemeColors } from "@/hooks/use-theme-colors";
import { Ionicons } from "@expo/vector-icons";
import * as countryCodesList from "country-codes-list";
import * as ImagePicker from "expo-image-picker";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  InteractionManager,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Country = {
  isoCode: string;
  name: string;
  dialCode: string;
};

function getFlagEmoji(isoCode: string) {
  return isoCode
    .toUpperCase()
    .replace(/./g, (char) => String.fromCodePoint(127397 + char.charCodeAt(0)));
}

const ALL_COUNTRIES: Country[] = Object.entries(
  countryCodesList.customList(
    "countryCode",
    "{countryNameEn}|{countryCallingCode}",
  ),
)
  .map(([isoCode, value]) => {
    const [name, dialCode] = (value as string).split("|");
    return { isoCode, name, dialCode: `+${dialCode}` };
  })
  .filter((c) => c.name && c.dialCode !== "+")
  .sort((a, b) => a.name.localeCompare(b.name));

const GENDER_OPTIONS = ["Male", "Female", "Prefer not to say"];

export default function CompleteProfile() {
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  const styles = getStyles(colors, insets.bottom, insets.top);
  const params = useLocalSearchParams<{ source?: string; name?: string }>();

  const [showBanner, setShowBanner] = useState(!!params.source);
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [name, setName] = useState(params.name ?? "");
  const [selectedCountry, setSelectedCountry] = useState<Country>(
    ALL_COUNTRIES.find((c) => c.isoCode === "US") ?? ALL_COUNTRIES[0],
  );
  const [phone, setPhone] = useState("");
  const [gender, setGender] = useState<string | null>(null);
  const [countryModalVisible, setCountryModalVisible] = useState(false);
  const [countrySearch, setCountrySearch] = useState("");
  const [genderModalVisible, setGenderModalVisible] = useState(false);

  // --- Busy state shared by both navigation buttons, so a tap is
  // acknowledged immediately and neither button can be double-fired
  // (or both fired at once) while the transition is in flight. ---
  const [pendingAction, setPendingAction] = useState<
    "complete" | "skip" | null
  >(null);

  const filteredCountries = useMemo(() => {
    if (!countrySearch.trim()) return ALL_COUNTRIES;
    const query = countrySearch.trim().toLowerCase();
    return ALL_COUNTRIES.filter(
      (c) => c.name.toLowerCase().includes(query) || c.dialCode.includes(query),
    );
  }, [countrySearch]);

  const bannerMessage =
    params.source === "signup"
      ? "Sign up successful! Welcome to Soova."
      : params.source === "signin"
        ? "Login successful! Welcome back."
        : null;

  useEffect(() => {
    if (!showBanner) return;

    const timer = setTimeout(() => {
      setShowBanner(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, [showBanner]);

  async function pickImage() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        "Permission needed",
        "Allow photo access to set a profile picture.",
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setAvatarUri(result.assets[0].uri);
    }
  }

  function navigateToLocation(action: "complete" | "skip") {
    if (pendingAction) return;
    setPendingAction(action);

    router.push("/location-access");

    // Clear once the navigation transition has settled, so the buttons
    // work again if the user comes back to this screen.
    InteractionManager.runAfterInteractions(() => {
      setPendingAction(null);
    });
  }

  function handleCompleteProfile() {
    navigateToLocation("complete");
  }

  function handleSkip() {
    navigateToLocation("skip");
  }

  function selectCountry(country: Country) {
    setSelectedCountry(country);
    setCountryModalVisible(false);
    setCountrySearch("");
  }

  return (
    <View style={styles.container}>
      <View style={[styles.circleOutline, styles.circleTopLeft]} />
      <View style={[styles.circleOutline, styles.circleBottomRight]} />

      {bannerMessage && showBanner && (
        <View style={styles.banner}>
          <Ionicons name="checkmark-circle" size={20} color={colors.onAccent} />
          <Text style={styles.bannerText}>{bannerMessage}</Text>
          <Pressable onPress={() => setShowBanner(false)}>
            <Ionicons name="close" size={18} color={colors.onAccent} />
          </Pressable>
        </View>
      )}

      <Pressable style={styles.backButton} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={22} color={colors.accent} />
      </Pressable>

      <Text style={styles.heading}>Complete Your Profile</Text>
      <Text style={styles.subheading}>
        Don&apos;t worry, only you can see your personal{"\n"}data. No one else
        will be able to see it.
      </Text>

      <View style={styles.avatarWrapper}>
        <View style={styles.avatarCircle}>
          {avatarUri ? (
            <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
          ) : (
            <Ionicons name="person" size={64} color={colors.accent} />
          )}
        </View>
        <Pressable style={styles.avatarEditButton} onPress={pickImage}>
          <Ionicons name="pencil" size={18} color={colors.onAccent} />
        </Pressable>
      </View>

      <Text style={styles.label}>Name</Text>
      <View style={styles.inputWrapper}>
        <Ionicons
          name="person-outline"
          size={20}
          color={colors.textMuted}
          style={styles.inputIcon}
        />
        <TextInput
          style={styles.input}
          placeholder="John Doe"
          placeholderTextColor={colors.textMuted}
          value={name}
          onChangeText={setName}
        />
      </View>

      <Text style={styles.label}>Phone Number</Text>
      <View style={styles.phoneRow}>
        <Pressable
          style={styles.countryCodeButton}
          onPress={() => setCountryModalVisible(true)}
        >
          <Text style={styles.countryFlag}>
            {getFlagEmoji(selectedCountry.isoCode)}
          </Text>
          <Text style={styles.countryCodeText}>{selectedCountry.dialCode}</Text>
          <Ionicons name="chevron-down" size={16} color={colors.textMuted} />
        </Pressable>
        <View style={styles.phoneInputWrapper}>
          <TextInput
            style={styles.input}
            placeholder="Enter Phone Number"
            placeholderTextColor={colors.textMuted}
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
          />
        </View>
      </View>

      <Text style={styles.label}>Gender</Text>
      <Pressable
        style={styles.inputWrapper}
        onPress={() => setGenderModalVisible(true)}
      >
        <Ionicons
          name="people-outline"
          size={20}
          color={colors.textMuted}
          style={styles.inputIcon}
        />
        <Text
          style={[
            styles.input,
            { color: gender ? colors.textPrimary : colors.textMuted },
          ]}
        >
          {gender ?? "Select"}
        </Text>
        <Ionicons name="chevron-down" size={18} color={colors.textMuted} />
      </Pressable>

      <Pressable
        style={[styles.cta, pendingAction && styles.ctaBusy]}
        onPress={handleCompleteProfile}
        disabled={!!pendingAction}
      >
        {pendingAction === "complete" ? (
          <ActivityIndicator color={colors.onAccent} size="small" />
        ) : (
          <Text style={styles.ctaText}>Complete Profile</Text>
        )}
      </Pressable>

      <Pressable
        style={styles.skipButton}
        onPress={handleSkip}
        disabled={!!pendingAction}
      >
        {pendingAction === "skip" ? (
          <ActivityIndicator color={colors.textMuted} size="small" />
        ) : (
          <Text
            style={[
              styles.skipButtonText,
              pendingAction && styles.skipButtonTextBusy,
            ]}
          >
            Skip
          </Text>
        )}
      </Pressable>

      <Modal
        transparent
        visible={countryModalVisible}
        animationType="slide"
        onRequestClose={() => {
          setCountryModalVisible(false);
          setCountrySearch("");
        }}
      >
        <View style={styles.countryModalBackdrop}>
          <View style={styles.countryModalCard}>
            <View style={styles.countryModalHeader}>
              <Text style={styles.countryModalTitle}>Select Country</Text>
              <Pressable
                onPress={() => {
                  setCountryModalVisible(false);
                  setCountrySearch("");
                }}
              >
                <Ionicons name="close" size={22} color={colors.textPrimary} />
              </Pressable>
            </View>

            <View style={styles.countrySearchWrapper}>
              <Ionicons name="search" size={18} color={colors.textMuted} />
              <TextInput
                style={styles.countrySearchInput}
                placeholder="Search country or code"
                placeholderTextColor={colors.textMuted}
                value={countrySearch}
                onChangeText={setCountrySearch}
                autoFocus
              />
            </View>

            <FlatList
              data={filteredCountries}
              keyExtractor={(item) => item.isoCode}
              keyboardShouldPersistTaps="handled"
              renderItem={({ item }) => (
                <Pressable
                  style={styles.countryOptionRow}
                  onPress={() => selectCountry(item)}
                >
                  <Text style={styles.countryFlag}>
                    {getFlagEmoji(item.isoCode)}
                  </Text>
                  <Text style={styles.countryOptionName}>{item.name}</Text>
                  <Text style={styles.countryOptionCode}>{item.dialCode}</Text>
                </Pressable>
              )}
            />
          </View>
        </View>
      </Modal>

      <Modal
        transparent
        visible={genderModalVisible}
        animationType="fade"
        onRequestClose={() => setGenderModalVisible(false)}
      >
        <Pressable
          style={styles.modalBackdrop}
          onPress={() => setGenderModalVisible(false)}
        >
          <View style={styles.optionsCard}>
            {GENDER_OPTIONS.map((option) => (
              <Pressable
                key={option}
                style={styles.optionRow}
                onPress={() => {
                  setGender(option);
                  setGenderModalVisible(false);
                }}
              >
                <Text style={styles.optionText}>{option}</Text>
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

function getStyles(colors: ThemeColors, bottomInset: number, topInset: number) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      paddingHorizontal: 24,
      paddingTop: 50,
      paddingBottom: bottomInset + 16,
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
    banner: {
      position: "absolute",
      top: topInset + 12,
      left: 16,
      right: 16,
      zIndex: 10,
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.accent,
      borderRadius: 16,
      paddingVertical: 12,
      paddingHorizontal: 16,
      gap: 10,
      shadowColor: "#000",
      shadowOpacity: 0.15,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 4 },
      elevation: 6,
    },
    bannerText: {
      flex: 1,
      fontFamily: Fonts.medium,
      fontSize: 13,
      color: colors.onAccent,
    },
    backButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      borderWidth: 1,
      borderColor: colors.outline,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 20,
    },
    heading: {
      fontFamily: Fonts.bold,
      fontSize: 28,
      color: colors.textPrimary,
      textAlign: "center",
    },
    subheading: {
      fontFamily: Fonts.regular,
      fontSize: 14,
      lineHeight: 21,
      color: colors.textMuted,
      marginTop: 10,
      marginBottom: 24,
      textAlign: "center",
    },
    avatarWrapper: {
      alignSelf: "center",
      marginBottom: 28,
    },
    avatarCircle: {
      width: 140,
      height: 140,
      borderRadius: 70,
      backgroundColor: colors.cardBackground,
      alignItems: "center",
      justifyContent: "center",
      overflow: "hidden",
    },
    avatarImage: {
      width: "100%",
      height: "100%",
    },
    avatarEditButton: {
      position: "absolute",
      bottom: 4,
      right: 4,
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.accent,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 3,
      borderColor: colors.background,
    },
    label: {
      fontFamily: Fonts.semiBold,
      fontSize: 14,
      color: colors.textPrimary,
      marginBottom: 8,
    },
    inputWrapper: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.cardBackground,
      borderRadius: 16,
      paddingHorizontal: 16,
      height: 56,
      marginBottom: 20,
    },
    inputIcon: {
      marginRight: 10,
    },
    input: {
      flex: 1,
      fontFamily: Fonts.regular,
      fontSize: 15,
      color: colors.textPrimary,
    },
    phoneRow: {
      flexDirection: "row",
      gap: 10,
      marginBottom: 20,
    },
    countryCodeButton: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.cardBackground,
      borderRadius: 16,
      paddingHorizontal: 12,
      height: 56,
      gap: 6,
    },
    countryFlag: {
      fontSize: 18,
    },
    countryCodeText: {
      fontFamily: Fonts.medium,
      fontSize: 15,
      color: colors.textPrimary,
    },
    phoneInputWrapper: {
      flex: 1,
      backgroundColor: colors.cardBackground,
      borderRadius: 16,
      paddingHorizontal: 16,
      height: 56,
      justifyContent: "center",
    },
    cta: {
      width: "100%",
      backgroundColor: colors.accent,
      borderRadius: 32,
      paddingVertical: 18,
      alignItems: "center",
      justifyContent: "center",
      marginTop: 8,
    },
    ctaBusy: {
      opacity: 0.7,
    },
    ctaText: {
      fontFamily: Fonts.semiBold,
      fontSize: 16,
      color: colors.onAccent,
    },
    skipButton: {
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 16,
    },
    skipButtonText: {
      fontFamily: Fonts.semiBold,
      fontSize: 15,
      color: colors.textMuted,
      textDecorationLine: "underline",
    },
    skipButtonTextBusy: {
      opacity: 0.5,
    },
    modalBackdrop: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: 40,
    },
    optionsCard: {
      width: "100%",
      backgroundColor: colors.background,
      borderRadius: 20,
      paddingVertical: 8,
    },
    optionRow: {
      paddingVertical: 14,
      paddingHorizontal: 20,
    },
    optionText: {
      fontFamily: Fonts.regular,
      fontSize: 15,
      color: colors.textPrimary,
    },
    countryModalBackdrop: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      justifyContent: "flex-end",
    },
    countryModalCard: {
      backgroundColor: colors.background,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      paddingTop: 20,
      paddingHorizontal: 20,
      height: "75%",
    },
    countryModalHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 16,
    },
    countryModalTitle: {
      fontFamily: Fonts.bold,
      fontSize: 18,
      color: colors.textPrimary,
    },
    countrySearchWrapper: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      backgroundColor: colors.cardBackground,
      borderRadius: 16,
      paddingHorizontal: 16,
      height: 48,
      marginBottom: 16,
    },
    countrySearchInput: {
      flex: 1,
      fontFamily: Fonts.regular,
      fontSize: 14,
      color: colors.textPrimary,
    },
    countryOptionRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.outline,
    },
    countryOptionName: {
      flex: 1,
      fontFamily: Fonts.regular,
      fontSize: 14,
      color: colors.textPrimary,
    },
    countryOptionCode: {
      fontFamily: Fonts.medium,
      fontSize: 14,
      color: colors.textMuted,
    },
  });
}
