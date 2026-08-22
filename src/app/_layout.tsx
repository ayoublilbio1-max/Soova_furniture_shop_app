import { Stack } from "expo-router";
import { useColorScheme } from "react-native";
import { SystemBars } from "react-native-edge-to-edge";

export default function RootLayout() {
  const scheme = useColorScheme();

  return (
    <>
      <SystemBars style={scheme === "dark" ? "light" : "dark"} />
      <Stack screenOptions={{ headerShown: false }} />
    </>
  );
}
