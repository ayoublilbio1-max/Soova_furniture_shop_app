// Reusable remote image component.
// Fixes a cold-start Android issue where the very first network image
// request can silently fail before the native networking layer is fully
// warmed up — without this, a failed first load just stays blank forever.
// Retries the same URL a few times, then falls back from Supabase to
// Cloudflare if it still won't load.

import { getCloudflareImageUrl, getSupabaseImageUrl } from "@/constants/storage";
import { Image, ImageStyle } from "expo-image";
import { useEffect, useRef, useState } from "react";
import { StyleProp } from "react-native";

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 500;

type RemoteImageProps = {
  path: string; // relative path under the product-images bucket, e.g. "chairs/chair_01/chair_01_a_thumb.webp"
  style?: StyleProp<ImageStyle>;
  contentFit?: "cover" | "contain";
};

export function RemoteImage({ path, style, contentFit = "cover" }: RemoteImageProps) {
  // Bumping "attempt" changes the Image's key below, forcing a real remount
  // (and therefore a fresh network request) rather than relying on internal
  // caching that may just replay the same failed attempt.
  const [attempt, setAttempt] = useState(0);
  const [useFallback, setUseFallback] = useState(false);
  const retryTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (retryTimeout.current) clearTimeout(retryTimeout.current);
    };
  }, []);

  const uri = useFallback ? getCloudflareImageUrl(path) : getSupabaseImageUrl(path);

  function handleError() {
    if (attempt < MAX_RETRIES) {
      // Still have retries left on the current source — try again shortly.
      retryTimeout.current = setTimeout(() => {
        setAttempt((prev) => prev + 1);
      }, RETRY_DELAY_MS);
    } else if (!useFallback) {
      // Exhausted retries on Supabase — switch to the Cloudflare fallback
      // and give it its own set of retries.
      setUseFallback(true);
      setAttempt(0);
    }
  }

  return (
    <Image
      key={`${uri}-${attempt}`}
      source={{ uri }}
      style={style}
      contentFit={contentFit}
      transition={150}
      onError={handleError}
    />
  );
}