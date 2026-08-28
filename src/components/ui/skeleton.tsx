// Reusable shimmering placeholder block for skeleton loading screens.
// Pulses opacity in a loop rather than a sweeping gradient — simpler, no
// extra dependencies, and reads clearly as "loading" at a glance.

import { useThemeColors } from "@/hooks/use-theme-colors";
import { useEffect, useRef } from "react";
import { Animated, Easing, StyleProp, ViewStyle } from "react-native";

type SkeletonProps = {
  width?: number | `${number}%`;
  height: number;
  borderRadius?: number;
  style?: StyleProp<ViewStyle>;
};

export function Skeleton({
  width = "100%",
  height,
  borderRadius = 8,
  style,
}: SkeletonProps) {
  const colors = useThemeColors();
  const pulseAnim = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 700,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.5,
          duration: 700,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pulseAnim]);

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor: colors.placeholder,
          opacity: pulseAnim,
        },
        style,
      ]}
    />
  );
}
