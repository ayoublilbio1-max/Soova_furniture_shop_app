// Reusable remote image component.
// Takes explicit primary + fallback URLs (matching the product data's own
// Supabase/Cloudflare URL pairs) instead of deriving them from a relative
// path. Retries the primary URL a few times to smooth over an Android
// cold-start network issue, then switches to the fallback URL if it still
// won't load. If the fallback also exhausts its retries (e.g. genuinely
// offline), shows a themed placeholder icon instead of a blank/broken
// image — everything else in the app works fully offline already, so this
// is a per-image fallback, not a blocking "you're offline" screen (see
// NetworkStatusBanner for the app-wide non-blocking notice).

import { useThemeColors } from "@/hooks/use-theme-colors";
import { Ionicons } from "@expo/vector-icons";
import { Image, ImageStyle } from "expo-image";
import { useEffect, useRef, useState } from "react";
import { StyleProp, StyleSheet, View, ViewStyle } from "react-native";

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 500;

type RemoteImageProps = {
  uri: string;
  fallbackUri?: string;
  style?: StyleProp<ImageStyle>;
  contentFit?: "cover" | "contain";
};

export function RemoteImage({
  uri,
  fallbackUri,
  style,
  contentFit = "cover",
}: RemoteImageProps) {
  const colors = useThemeColors();
  const [attempt, setAttempt] = useState(0);
  const [useFallback, setUseFallback] = useState(false);
  const [failed, setFailed] = useState(false);
  const retryTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (retryTimeout.current) clearTimeout(retryTimeout.current);
    };
  }, []);

  const activeUri = useFallback && fallbackUri ? fallbackUri : uri;

  function handleError() {
    if (attempt < MAX_RETRIES) {
      retryTimeout.current = setTimeout(() => {
        setAttempt((prev) => prev + 1);
      }, RETRY_DELAY_MS);
    } else if (!useFallback && fallbackUri) {
      setUseFallback(true);
      setAttempt(0);
    } else {
      setFailed(true);
    }
  }

  if (failed) {
    return (
      <View
        style={[
          style as StyleProp<ViewStyle>,
          styles.placeholder,
          { backgroundColor: colors.cardBackground },
        ]}
      >
        <Ionicons name="image-outline" size={28} color={colors.textMuted} />
      </View>
    );
  }

  return (
    <Image
      key={`${activeUri}-${attempt}`}
      source={{ uri: activeUri }}
      style={style}
      contentFit={contentFit}
      transition={150}
      onError={handleError}
    />
  );
}

const styles = StyleSheet.create({
  placeholder: {
    alignItems: "center",
    justifyContent: "center",
  },
});
