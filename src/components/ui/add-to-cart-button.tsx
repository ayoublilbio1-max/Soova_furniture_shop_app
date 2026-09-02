// Shared "Add to Cart" button — used by every product card and detail
// screen in the app. Handles its own busy/confirmation state so every
// screen gets identical behavior from one place instead of duplicated logic.
//
// Two visual shapes:
//   - "icon": small square button (grid card corner), icon only
//   - "full": full-width pill with text (wishlist rows, product details)
//
// Sequence on tap: idle -> loading (brief) -> success (green background,
// white check, 3s) -> back to idle. The success state is a transient
// confirmation of the action that just happened, not a persistent "this
// item is in your cart" claim — it always reverts, even if the item stays
// in the cart.

import { ThemeColors } from "@/constants/colors";
import { Fonts } from "@/constants/fonts";
import { useCartStore } from "@/store/cart-store";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Pressable,
    StyleProp,
    StyleSheet,
    Text,
    TextStyle,
    ViewStyle,
} from "react-native";

const SUCCESS_GREEN = "#88E788"; // same green used on the Free Shipping icon
const SUCCESS_DURATION_MS = 3000;
const LOADING_DURATION_MS = 450;

type Phase = "idle" | "loading" | "success";

type AddToCartButtonProps = {
  productId: string;
  colors: ThemeColors;
  variant?: "icon" | "full";
  size?: number; // icon variant only — square dimension
  style?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
};

export function AddToCartButton({
  productId,
  colors,
  variant = "icon",
  size = 32,
  style,
  labelStyle,
}: AddToCartButtonProps) {
  const addToCart = useCartStore((s) => s.addToCart);
  const [phase, setPhase] = useState<Phase>("idle");
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  function handlePress() {
    if (phase !== "idle") return;
    setPhase("loading");

    // Deliberate confirmation delay — this isn't standing in for network
    // work, it just gives the loading→success swap enough time to read as
    // a real confirmation instead of an instant flicker.
    timeoutRef.current = setTimeout(() => {
      addToCart(productId);
      setPhase("success");

      timeoutRef.current = setTimeout(() => {
        setPhase("idle");
      }, SUCCESS_DURATION_MS);
    }, LOADING_DURATION_MS);
  }

  const isBusy = phase !== "idle";

  if (variant === "full") {
    return (
      <Pressable
        style={[
          styles.fullButton,
          {
            backgroundColor:
              phase === "success" ? SUCCESS_GREEN : colors.accent,
          },
          phase === "loading" && styles.busy,
          style,
        ]}
        onPress={handlePress}
        disabled={isBusy}
      >
        {phase === "loading" ? (
          <ActivityIndicator color={colors.onAccent} size="small" />
        ) : (
          <>
            <Ionicons
              name={phase === "success" ? "checkmark" : "cart-outline"}
              size={16}
              color="#FFFFFF"
            />
            <Text
              style={[styles.fullButtonText, { color: "#FFFFFF" }, labelStyle]}
            >
              {phase === "success" ? "Added to Cart" : "Add to Cart"}
            </Text>
          </>
        )}
      </Pressable>
    );
  }

  const iconSize = size * 0.56;

  return (
    <Pressable
      style={[
        styles.iconButton,
        {
          width: size,
          height: size,
          borderRadius: size * 0.3,
          backgroundColor: phase === "success" ? SUCCESS_GREEN : colors.accent,
        },
        phase === "loading" && styles.busy,
        style,
      ]}
      onPress={handlePress}
      disabled={isBusy}
    >
      {phase === "loading" ? (
        <ActivityIndicator color={colors.onAccent} size="small" />
      ) : phase === "success" ? (
        <Ionicons name="checkmark" size={iconSize} color="#FFFFFF" />
      ) : (
        <MaterialCommunityIcons
          name="cart-plus"
          size={iconSize}
          color={colors.onAccent}
        />
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  iconButton: {
    alignItems: "center",
    justifyContent: "center",
  },
  fullButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 20,
    paddingVertical: 10,
  },
  fullButtonText: {
    fontFamily: Fonts.semiBold,
    fontSize: 13,
  },
  busy: {
    opacity: 0.7,
  },
});
