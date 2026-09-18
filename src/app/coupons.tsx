// My Coupons screen — reached from Account > "My Coupons". Full-width list
// of the same real coupons Shop's CouponCard reads (SHOP_COUPONS), just
// styled as rows instead of a horizontal scroll of compact cards. Same
// collect/copy state machine as CouponCard, so collecting a coupon here
// or on Shop keeps both screens in agreement (shared cart-store state).
// The "unlock" subtitle is computed from the real live cart subtotal.

import { ThemeColors } from "@/constants/colors";
import { Fonts } from "@/constants/fonts";
import { Coupon, SHOP_COUPONS } from "@/data/coupons";
import { products } from "@/data/products";
import { useThemeColors } from "@/hooks/use-theme-colors";
import { useCartStore } from "@/store/cart-store";
import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Easing,
  ScrollView,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

const COLLECT_LOADING_MS = 450;
const COPY_FEEDBACK_DURATION_MS = 1500;

type Phase = "idle" | "loading" | "copied" | "collected";

function computeCartSubtotal(
  items: { productId: string; quantity: number }[],
) {
  return items.reduce((sum, item) => {
    const product = products.find((p) => p.id === item.productId);
    return sum + (product ? product.price * item.quantity : 0);
  }, 0);
}

// --- Single full-width coupon row, matching the reference design ---
function MyCouponRow({
  coupon,
  subtotal,
  colors,
  styles,
}: {
  coupon: Coupon;
  subtotal: number;
  colors: ThemeColors;
  styles: ReturnType<typeof getStyles>;
}) {
  const collectedSpecialOfferIds = useCartStore(
    (s) => s.collectedSpecialOfferIds,
  );
  const collectSpecialOffer = useCartStore((s) => s.collectSpecialOffer);

  const alreadyCollected =
    !coupon.code && collectedSpecialOfferIds.includes(coupon.id);
  const [phase, setPhase] = useState<Phase>(
    alreadyCollected ? "collected" : "idle",
  );
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  function popAnimation() {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.02,
        duration: 100,
        easing: Easing.ease,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 150,
        easing: Easing.ease,
        useNativeDriver: true,
      }),
    ]).start();
  }

  function handlePress() {
    if (phase !== "idle") return;
    popAnimation();
    setPhase("loading");

    if (coupon.code) {
      timeoutRef.current = setTimeout(async () => {
        await Clipboard.setStringAsync(coupon.code!);
        setPhase("copied");
        timeoutRef.current = setTimeout(() => {
          setPhase("collected");
        }, COPY_FEEDBACK_DURATION_MS);
      }, COLLECT_LOADING_MS);
    } else {
      timeoutRef.current = setTimeout(() => {
        collectSpecialOffer(coupon.id);
        setPhase("collected");
      }, COLLECT_LOADING_MS);
    }
  }

  const remaining = Math.max(0, coupon.minOrder - subtotal);
  const isEligible = remaining === 0;

  let subtitle: string;
  if (phase === "collected") {
    subtitle = coupon.code
      ? "Copied — paste it at checkout"
      : "Applied automatically at checkout";
  } else if (isEligible) {
    subtitle = "You're eligible for this offer!";
  } else {
    subtitle = `Add items worth $${remaining.toFixed(2)} more to unlock`;
  }

  const buttonLabel =
    phase === "loading"
      ? ""
      : phase === "copied"
        ? "Copied!"
        : phase === "collected"
          ? "Collected"
          : coupon.code
            ? "Copy Code"
            : "Collect";

  return (
    <Animated.View
      style={[styles.card, { transform: [{ scale: scaleAnim }] }]}
    >
      <Text style={styles.codeText}>
        {coupon.code ?? "Automatic Discount"}
      </Text>
      <Text style={styles.subtitleText}>{subtitle}</Text>

      <View style={styles.discountRow}>
        <Ionicons name="pricetag" size={16} color={colors.accent} />
        <Text style={styles.discountText}>
          Get ${coupon.amountOff} OFF
        </Text>
      </View>

      <Pressable
        style={[
          styles.actionButton,
          (phase === "collected" || phase === "copied") &&
            styles.actionButtonDone,
        ]}
        onPress={handlePress}
        disabled={phase !== "idle"}
      >
        {phase === "loading" ? (
          <ActivityIndicator color={colors.textPrimary} size="small" />
        ) : (
          <Text
            style={[
              styles.actionButtonText,
              (phase === "collected" || phase === "copied") &&
                styles.actionButtonTextDone,
            ]}
          >
            {buttonLabel}
          </Text>
        )}
      </Pressable>
    </Animated.View>
  );
}

export default function MyCoupons() {
  const colors = useThemeColors();
  const styles = getStyles(colors);
  const items = useCartStore((s) => s.items);
  const subtotal = computeCartSubtotal(items);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>My Coupons</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.sectionTitle}>Best offers for you</Text>

        {SHOP_COUPONS.map((coupon) => (
          <MyCouponRow
            key={coupon.id}
            coupon={coupon}
            subtotal={subtotal}
            colors={colors}
            styles={styles}
          />
        ))}
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
      marginBottom: 20,
    },
    backButton: {
      width: 40,
      height: 40,
      alignItems: "center",
      justifyContent: "center",
    },
    headerTitle: {
      fontFamily: Fonts.bold,
      fontSize: 18,
      color: colors.textPrimary,
    },
    scrollContent: {
      paddingHorizontal: 24,
      paddingBottom: 40,
    },
    sectionTitle: {
      fontFamily: Fonts.bold,
      fontSize: 17,
      color: colors.textPrimary,
      marginBottom: 16,
    },
    card: {
      backgroundColor: colors.cardBackground,
      borderRadius: 16,
      padding: 16,
      marginBottom: 14,
    },
    codeText: {
      fontFamily: Fonts.bold,
      fontSize: 15,
      color: colors.textPrimary,
      marginBottom: 4,
    },
    subtitleText: {
      fontFamily: Fonts.regular,
      fontSize: 12,
      color: colors.textMuted,
      marginBottom: 10,
    },
    discountRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      marginBottom: 14,
    },
    discountText: {
      fontFamily: Fonts.semiBold,
      fontSize: 14,
      color: colors.textPrimary,
    },
    actionButton: {
      backgroundColor: colors.background,
      borderRadius: 14,
      paddingVertical: 12,
      alignItems: "center",
      justifyContent: "center",
      minHeight: 44,
    },
    actionButtonDone: {
      backgroundColor: colors.outline,
    },
    actionButtonText: {
      fontFamily: Fonts.semiBold,
      fontSize: 13,
      color: colors.textPrimary,
      letterSpacing: 0.5,
    },
    actionButtonTextDone: {
      color: colors.textMuted,
    },
  });
}