import { ThemeColors } from "@/constants/colors";
import { Fonts } from "@/constants/fonts";
import { categories } from "@/data/categories";
import { useThemeColors } from "@/hooks/use-theme-colors";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useRef } from "react";
import {
    Animated,
    Easing,
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function CategoryTile({
  name,
  icon,
  colors,
  styles,
  onPress,
}: {
  name: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  colors: ThemeColors;
  styles: ReturnType<typeof getStyles>;
  onPress: () => void;
}) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  function handlePressIn() {
    Animated.timing(scaleAnim, {
      toValue: 0.92,
      duration: 100,
      easing: Easing.ease,
      useNativeDriver: true,
    }).start();
  }

  function handlePressOut() {
    Animated.timing(scaleAnim, {
      toValue: 1,
      duration: 150,
      easing: Easing.ease,
      useNativeDriver: true,
    }).start();
  }

  return (
    <AnimatedPressable
      style={[styles.tile, { transform: [{ scale: scaleAnim }] }]}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={onPress}
    >
      <View style={styles.tileIconCircle}>
        <MaterialCommunityIcons name={icon} size={28} color={colors.accent} />
      </View>
      <Text style={styles.tileLabel}>{name}</Text>
    </AnimatedPressable>
  );
}

export default function Category() {
  const colors = useThemeColors();
  const styles = getStyles(colors);

  function handleCategoryPress(id: string, name: string) {
    if (id === "sofa") {
      router.push("/sofa-subcategories");
    } else {
      router.push({
        pathname: "/category-products",
        params: { category: id, title: name },
      });
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>Category</Text>
        <View style={styles.backButton} />
      </View>

      <View style={styles.grid}>
        {categories.map((category) => (
          <CategoryTile
            key={category.id}
            name={category.name}
            icon={category.icon}
            colors={colors}
            styles={styles}
            onPress={() => handleCategoryPress(category.id, category.name)}
          />
        ))}
      </View>
    </View>
  );
}

function getStyles(colors: ThemeColors) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      paddingTop: 60,
      paddingHorizontal: 24,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 28,
    },
    backButton: {
      width: 40,
      height: 40,
      alignItems: "center",
      justifyContent: "center",
    },
    headerTitle: {
      fontFamily: Fonts.bold,
      fontSize: 20,
      color: colors.textPrimary,
    },
    grid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 13.7,
    },
    tile: {
      width: "22%",
      alignItems: "center",
      gap: 8,
    },
    tileIconCircle: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: colors.placeholder,
      alignItems: "center",
      justifyContent: "center",
    },
    tileLabel: {
      fontFamily: Fonts.medium,
      fontSize: 12,
      color: colors.textPrimary,
      textAlign: "center",
    },
  });
}
