import { AppSplashOverlay } from "@/components/ui/app-splash-overlay";
import { NetworkStatusBanner } from "@/components/ui/network-status-banner";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { useColorScheme } from "react-native";
import { SystemBars } from "react-native-edge-to-edge";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

// Keep the native splash (plain terracotta, no logo) visible until this
// module runs, then hand off to AppSplashOverlay — a JS component that can
// be resized/repositioned without ever needing another native rebuild.
SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const scheme = useColorScheme();

  useEffect(() => {
    SplashScreen.hideAsync().catch(() => {});
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <SystemBars style={scheme === "dark" ? "light" : "dark"} />
        <Stack screenOptions={{ headerShown: false }} />
        <NetworkStatusBanner />
        <AppSplashOverlay />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
