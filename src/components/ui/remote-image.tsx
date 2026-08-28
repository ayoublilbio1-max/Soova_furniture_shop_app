// Reusable remote image component.
// Takes explicit primary + fallback URLs (matching the product data's own
// Supabase/Cloudflare URL pairs) instead of deriving them from a relative
// path. Retries the primary URL a few times to smooth over an Android
// cold-start network issue, then switches to the fallback URL if it still
// won't load.

import { Image, ImageStyle } from "expo-image";
import { useEffect, useRef, useState } from "react";
import { StyleProp } from "react-native";

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
  const [attempt, setAttempt] = useState(0);
  const [useFallback, setUseFallback] = useState(false);
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
    }
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
