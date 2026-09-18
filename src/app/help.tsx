// Help Center screen — reached from Account > "Help Center". Static FAQ
// accordion covering the app's actual behavior (orders, payments, coupons,
// shipping), plus a contact row matching the same honest "no live link yet"
// pattern used by the app's other demo-limitation notices.

import { ThemeColors } from "@/constants/colors";
import { Fonts } from "@/constants/fonts";
import { useThemeColors } from "@/hooks/use-theme-colors";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import {
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

const DEVELOPER_CONTACT_URL = "https://www.fiverr.com/ayoubgharts";

type FaqItem = {
  id: string;
  question: string;
  answer: string;
};

const FAQ_ITEMS: FaqItem[] = [
  {
    id: "orders",
    question: "How do I track my orders?",
    answer:
      "Go to Account > My Orders to see every order you've placed, with a date, item list, and totals for each one.",
  },
  {
    id: "payments",
    question: "What payment methods are accepted?",
    answer:
      "Cash On Delivery and saved cards are fully functional in this demo. PayPal, Apple Pay, and Google Pay are shown for completeness but aren't connected to a live provider.",
  },
  {
    id: "card-security",
    question: "Is my card information stored securely?",
    answer:
      "Only the last four digits, cardholder name, and expiry are ever saved — never the full card number or CVV, matching how real payment processors handle card data.",
  },
  {
    id: "coupons",
    question: "How do I use a coupon?",
    answer:
      "Check Account > My Coupons for current offers. Coupons with a code can be copied and pasted into Cart's promo field; others apply automatically once your cart qualifies.",
  },
  {
    id: "address",
    question: "How do I change my shipping address?",
    answer:
      "Go to Account > Manage Address to add, select, or remove a saved address.",
  },
  {
    id: "returns",
    question: "Can I cancel or return an order?",
    answer:
      "Soova is a portfolio demonstration with no real fulfillment behind it, so there's no live cancellation or return process — orders exist only as a record in My Orders.",
  },
];

// --- Single expandable FAQ row ---
function FaqRow({
  item,
  expanded,
  colors,
  styles,
  onPress,
}: {
  item: FaqItem;
  expanded: boolean;
  colors: ThemeColors;
  styles: ReturnType<typeof getStyles>;
  onPress: () => void;
}) {
  return (
    <View style={styles.faqCard}>
      <Pressable style={styles.faqHeader} onPress={onPress}>
        <Text style={styles.faqQuestion}>{item.question}</Text>
        <Ionicons
          name={expanded ? "chevron-up" : "chevron-down"}
          size={18}
          color={colors.textMuted}
        />
      </Pressable>
      {expanded && <Text style={styles.faqAnswer}>{item.answer}</Text>}
    </View>
  );
}

export default function Help() {
  const colors = useThemeColors();
  const styles = getStyles(colors);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  function toggle(id: string) {
    setExpandedId((current) => (current === id ? null : id));
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>Help Center</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.sectionLabel}>Frequently Asked Questions</Text>

        {FAQ_ITEMS.map((item) => (
          <FaqRow
            key={item.id}
            item={item}
            expanded={expandedId === item.id}
            colors={colors}
            styles={styles}
            onPress={() => toggle(item.id)}
          />
        ))}

        <Text style={styles.sectionLabel}>Still Need Help?</Text>
        <Pressable
          style={styles.contactCard}
          onPress={() => Linking.openURL(DEVELOPER_CONTACT_URL)}
        >
          <View style={styles.contactIconCircle}>
            <Ionicons name="mail-outline" size={20} color={colors.accent} />
          </View>
          <View style={styles.contactTextWrapper}>
            <Text style={styles.contactTitle}>Contact the developer</Text>
            <Text style={styles.contactBody}>www.fiverr.com/ayoubgharts</Text>
          </View>
          <Ionicons name="open-outline" size={18} color={colors.textMuted} />
        </Pressable>
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
      paddingBottom: 50,
    },
    sectionLabel: {
      fontFamily: Fonts.semiBold,
      fontSize: 14,
      color: colors.textPrimary,
      marginBottom: 12,
      marginTop: 8,
    },
    faqCard: {
      backgroundColor: colors.cardBackground,
      borderRadius: 16,
      padding: 16,
      marginBottom: 12,
    },
    faqHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    faqQuestion: {
      flex: 1,
      fontFamily: Fonts.semiBold,
      fontSize: 14,
      color: colors.textPrimary,
      marginRight: 12,
    },
    faqAnswer: {
      fontFamily: Fonts.regular,
      fontSize: 13,
      lineHeight: 20,
      color: colors.textMuted,
      marginTop: 12,
    },
    contactCard: {
      flexDirection: "row",
      alignItems: "center",
      gap: 14,
      backgroundColor: colors.cardBackground,
      borderRadius: 16,
      padding: 16,
      marginBottom: 20,
    },
    contactIconCircle: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: colors.background,
      alignItems: "center",
      justifyContent: "center",
    },
    contactTextWrapper: {
      flex: 1,
      gap: 2,
    },
    contactTitle: {
      fontFamily: Fonts.semiBold,
      fontSize: 14,
      color: colors.textPrimary,
    },
    contactBody: {
      fontFamily: Fonts.regular,
      fontSize: 12,
      color: colors.textMuted,
      lineHeight: 17,
    },
  });
}
