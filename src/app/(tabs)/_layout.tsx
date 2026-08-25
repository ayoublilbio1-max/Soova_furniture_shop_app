import { ThemeColors } from "@/constants/colors";
import { useThemeColors } from "@/hooks/use-theme-colors";
import { Image, ImageSource } from "expo-image";
import { Tabs } from "expo-router";
import { ComponentProps } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type TabBarProps = Parameters<
  NonNullable<ComponentProps<typeof Tabs>["tabBar"]>
>[0];

const TAB_ICON_SOURCES: Record<string, ImageSource> = {
  home: require("../../../assets/icons/home.webp"),
  shop: require("../../../assets/icons/shop.webp"),
  wishlist: require("../../../assets/icons/wishlist.webp"),
  cart: require("../../../assets/icons/cart.webp"),
  account: require("../../../assets/icons/account.webp"),
};

function CustomTabBar({ state, descriptors, navigation }: TabBarProps) {
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  const styles = getStyles(colors, insets.bottom);

  return (
    <View style={styles.bar}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label = (options.title ?? route.name) as string;
        const focused = state.index === index;
        const iconSource = TAB_ICON_SOURCES[route.name];

        function handlePress() {
          const event = navigation.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true,
          });

          if (!focused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        }

        return (
          <Pressable
            key={route.key}
            onPress={handlePress}
            android_ripple={{ color: "transparent", borderless: true }}
            style={styles.item}
          >
            <Image
              source={iconSource}
              style={styles.icon}
              tintColor={focused ? colors.accent : colors.textMuted}
            />
            <Text
              style={[
                styles.label,
                { color: focused ? colors.accent : colors.textMuted },
              ]}
            >
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="home" options={{ title: "Home" }} />
      <Tabs.Screen name="shop" options={{ title: "Shop" }} />
      <Tabs.Screen name="wishlist" options={{ title: "Wishlist" }} />
      <Tabs.Screen name="cart" options={{ title: "Cart" }} />
      <Tabs.Screen name="account" options={{ title: "Account" }} />
    </Tabs>
  );
}

function getStyles(colors: ThemeColors, bottomInset: number) {
  return StyleSheet.create({
    bar: {
      flexDirection: "row",
      backgroundColor: colors.background,
      borderTopWidth: 1,
      borderTopColor: colors.outline,
      paddingTop: 10,
      paddingBottom: bottomInset + 8,
    },
    item: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      gap: 1,
    },
    icon: {
      width: 26,
      height: 22,
    },
    label: {
      fontSize: 9,
    },
  });
}
