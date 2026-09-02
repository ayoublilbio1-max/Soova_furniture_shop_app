// Sale coupon card — used on the Shop screen. Special coupons apply
// automatically as a cart discount once collected (tracked in the cart
// store); coded coupons copy their code to the clipboard. Both types show
// a brief loading state before confirming, so the button always
// acknowledges the tap rather than flipping state instantly. Kept as its
// own component so future edits touch this one file instead of the full
// Shop screen.

import { ThemeColors } from "@/constants/colors";
import { Fonts } from "@/constants/fonts";
import { Coupon } from "@/data/coupons";
import { useCartStore } from "@/store/cart-store";
import * as Clipboard from "expo-clipboard";
import { useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Animated,
    Easing,
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";

const COLLECT_LOADING_MS = 450;
const COPY_FEEDBACK_DURATION_MS = 1500;

type Phase = "idle" | "loading" | "copied" | "collected";

export function CouponCard({
  coupon,
  colors,
}: {
  coupon: Coupon;
  colors: ThemeColors;
}) {
  const styles = getStyles(colors);
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
        toValue: 1.05,
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

  function handleCollect() {
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
      // Special coupons have no code to copy — collecting them registers
      // the discount directly in the cart store instead.
      timeoutRef.current = setTimeout(() => {
        collectSpecialOffer(coupon.id);
        setPhase("collected");
      }, COLLECT_LOADING_MS);
    }
  }

  const showSpinner = phase === "loading";
  const buttonLabel =
    phase === "copied"
      ? "Copied!"
      : phase === "collected"
        ? "Collected"
        : "Collect";

  return (
    <Animated.View
      style={[styles.couponCard, { transform: [{ scale: scaleAnim }] }]}
    >
      <Text style={styles.couponAmount}>
        ${coupon.amountOff} <Text style={styles.couponOff}>OFF</Text>
      </Text>
      <Text style={styles.couponMinOrder}>orders ${coupon.minOrder}+</Text>
      <View style={styles.couponDivider} />
      {coupon.code ? (
        <Text style={styles.couponCode}>{coupon.code}</Text>
      ) : (
        <View style={styles.couponSpecialTag}>
          <Text style={styles.couponSpecialText}>Special coupon</Text>
        </View>
      )}
      <Pressable
        style={[
          styles.collectButton,
          (phase === "collected" || phase === "copied") &&
            styles.collectButtonCollected,
          phase === "loading" && styles.collectButtonBusy,
        ]}
        onPress={handleCollect}
        disabled={phase !== "idle"}
      >
        {showSpinner ? (
          <ActivityIndicator color={colors.onAccent} size="small" />
        ) : (
          <Text style={styles.collectButtonText}>{buttonLabel}</Text>
        )}
      </Pressable>
    </Animated.View>
  );
}

function getStyles(colors: ThemeColors) {
  return StyleSheet.create({
    couponCard: {
      width: 140,
      backgroundColor: colors.cardBackground,
      borderRadius: 16,
      padding: 16,
      alignItems: "center",
    },
    couponAmount: {
      fontFamily: Fonts.bold,
      fontSize: 18,
      color: colors.accent,
      marginBottom: 4,
    },
    couponOff: {
      fontFamily: Fonts.semiBold,
      fontSize: 12,
      color: colors.accent,
    },
    couponMinOrder: {
      fontFamily: Fonts.regular,
      fontSize: 12,
      color: colors.textMuted,
      marginBottom: 12,
      textAlign: "center",
    },
    couponDivider: {
      width: "100%",
      height: 1,
      borderStyle: "dashed",
      borderWidth: 1,
      borderColor: colors.outline,
      marginBottom: 12,
    },
    couponSpecialTag: {
      backgroundColor: colors.background,
      borderRadius: 12,
      paddingHorizontal: 10,
      paddingVertical: 4,
      marginBottom: 12,
    },
    couponSpecialText: {
      fontFamily: Fonts.medium,
      fontSize: 11,
      color: colors.textPrimary,
    },
    couponCode: {
      fontFamily: Fonts.bold,
      fontSize: 13,
      color: colors.textPrimary,
      marginBottom: 12,
    },
    collectButton: {
      backgroundColor: colors.accent,
      borderRadius: 20,
      paddingHorizontal: 20,
      paddingVertical: 8,
      width: "100%",
      alignItems: "center",
      justifyContent: "center",
      minHeight: 34,
    },
    collectButtonCollected: {
      backgroundColor: colors.textMuted,
    },
    collectButtonBusy: {
      opacity: 0.8,
    },
    collectButtonText: {
      fontFamily: Fonts.semiBold,
      fontSize: 13,
      color: colors.onAccent,
    },
  });
}
