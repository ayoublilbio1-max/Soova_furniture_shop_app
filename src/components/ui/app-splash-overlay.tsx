// src/components/ui/app-splash-overlay.tsx — JS-rendered splash logo shown
// right after the native splash screen hides. Rendered as an ordinary
// <Image> with resizeMode="contain", completely outside Android's
// icon-shaped splash container — so the wide wordmark's real aspect ratio
// is respected and nothing gets clipped, on any screen. Any future
// size/position tweak here is a pure JS change, no EAS rebuild needed
// (unlike the native splash image, which is baked in at build time).

import { useEffect, useState } from "react";
import { Animated, Image, StyleSheet, useWindowDimensions } from "react-native";

const SPLASH_BACKGROUND = "#A9572F"; // matches app.json's native splash backgroundColor
const VISIBLE_DURATION_MS = 900;
const FADE_DURATION_MS = 250;

export function AppSplashOverlay() {
  const { width } = useWindowDimensions();
  const [visible, setVisible] = useState(true);
  const opacity = useState(() => new Animated.Value(1))[0];

  useEffect(() => {
    const timer = setTimeout(() => {
      Animated.timing(opacity, {
        toValue: 0,
        duration: FADE_DURATION_MS,
        useNativeDriver: true,
      }).start(() => setVisible(false));
    }, VISIBLE_DURATION_MS);

    return () => clearTimeout(timer);
  }, [opacity]);

  if (!visible) return null;

  // Logo is a wide wordmark (~4.5:1) — sizing off a width percentage means
  // it scales to fit any screen with consistent margin, never touching
  // the edges the way a fixed pixel width could on narrower phones.
  const logoWidth = width * 0.55;
  const logoHeight = logoWidth / 4.5;

  return (
    <Animated.View style={[styles.container, { opacity }]} pointerEvents="none">
      <Image
        source={require("../../../assets/images/splash-icon.png")}
        style={{ width: logoWidth, height: logoHeight }}
        resizeMode="contain"
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: SPLASH_BACKGROUND,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  },
});
