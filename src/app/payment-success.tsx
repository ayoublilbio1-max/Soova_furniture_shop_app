// Payment Success screen — reached right after Payment Methods confirms an
// order. No back arrow (checkout is complete). Branches its wording based
// on how the order was paid: Cash on Delivery hasn't actually been paid
// yet, so it gets "Order Confirmed" + a courier note instead of implying
// a payment already went through.

import { ThemeColors } from "@/constants/colors";
import { Fonts } from "@/constants/fonts";
import { useThemeColors } from "@/hooks/use-theme-colors";
import { useCartStore } from "@/store/cart-store";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

export default function PaymentSuccess() {
  const colors = useThemeColors();
  const styles = getStyles(colors);
  const lastOrder = useCartStore((s) => s.lastOrder);

  const isCashOnDelivery = lastOrder?.paymentMethod === "cash";

  return (
    <View style={styles.container}>
      <View style={styles.checkCircle}>
        {isCashOnDelivery ? (
          <MaterialCommunityIcons
            name="truck-fast-outline"
            size={44}
            color={colors.onAccent}
          />
        ) : (
          <Ionicons name="checkmark" size={48} color={colors.onAccent} />
        )}
      </View>

      <Text style={styles.title}>
        {isCashOnDelivery ? "Order Confirmed!" : "Payment Successful!"}
      </Text>
      <Text style={styles.subtitle}>
        {isCashOnDelivery
          ? "Pay in cash when your order arrives. Our delivery courier will contact you to confirm details."
          : "Thank you for your purchase."}
      </Text>

      <View style={styles.actions}>
        <Pressable
          style={styles.primaryButton}
          onPress={() => router.replace("/review-summary")}
        >
          <Text style={styles.primaryButtonText}>View Order</Text>
        </Pressable>

        <Pressable
          style={styles.secondaryButton}
          onPress={() => router.replace("/e-receipt")}
        >
          <Text style={styles.secondaryButtonText}>
            {isCashOnDelivery ? "View Order Summary" : "View E-Receipt"}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

function getStyles(colors: ThemeColors) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 32,
    },
    checkCircle: {
      width: 96,
      height: 96,
      borderRadius: 48,
      backgroundColor: colors.accent,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 28,
    },
    title: {
      fontFamily: Fonts.bold,
      fontSize: 22,
      color: colors.textPrimary,
      marginBottom: 8,
      textAlign: "center",
    },
    subtitle: {
      fontFamily: Fonts.regular,
      fontSize: 14,
      color: colors.textMuted,
      marginBottom: 48,
      textAlign: "center",
      lineHeight: 20,
    },
    actions: {
      width: "100%",
      gap: 12,
    },
    primaryButton: {
      backgroundColor: colors.accent,
      borderRadius: 28,
      paddingVertical: 16,
      alignItems: "center",
    },
    primaryButtonText: {
      fontFamily: Fonts.semiBold,
      fontSize: 15,
      color: colors.onAccent,
    },
    secondaryButton: {
      backgroundColor: colors.cardBackground,
      borderRadius: 28,
      paddingVertical: 16,
      alignItems: "center",
    },
    secondaryButtonText: {
      fontFamily: Fonts.semiBold,
      fontSize: 15,
      color: colors.textPrimary,
    },
  });
}
