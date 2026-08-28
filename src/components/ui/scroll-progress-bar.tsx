// Thin accent-colored progress bar for horizontal pagers — replaces dot
// indicators. The thumb's position and width are driven directly by the
// paired ScrollView's live scroll offset (native-driven, no JS bridge
// traffic per frame).

import { ThemeColors } from "@/constants/colors";
import { Animated, StyleSheet, View } from "react-native";

type ScrollProgressBarProps = {
  scrollX: Animated.Value;
  viewportWidth: number;
  pageCount: number;
  colors: ThemeColors;
  barWidth?: number;
};

export function ScrollProgressBar({
  scrollX,
  viewportWidth,
  pageCount,
  colors,
  barWidth = 60,
}: ScrollProgressBarProps) {
  if (pageCount <= 1 || viewportWidth <= 0) return null;

  const contentWidth = viewportWidth * pageCount;
  const maxScroll = contentWidth - viewportWidth;
  const thumbWidth = Math.max(barWidth * (viewportWidth / contentWidth), 20);
  const maxTranslate = barWidth - thumbWidth;

  const translateX = scrollX.interpolate({
    inputRange: [0, maxScroll],
    outputRange: [0, maxTranslate],
    extrapolate: "clamp",
  });

  return (
    <View
      style={[
        styles.track,
        { width: barWidth, backgroundColor: colors.outline },
      ]}
    >
      <Animated.View
        style={[
          styles.thumb,
          {
            width: thumbWidth,
            backgroundColor: colors.accent,
            transform: [{ translateX }],
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: 4,
    borderRadius: 2,
    overflow: "hidden",
    alignSelf: "center",
    marginBottom: 24,
  },
  thumb: {
    height: 4,
    borderRadius: 2,
  },
});
