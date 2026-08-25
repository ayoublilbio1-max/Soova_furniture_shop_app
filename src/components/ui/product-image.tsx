import {
    getCloudflareImageUrl,
    getSupabaseImageUrl,
} from "@/constants/storage";
import { Image, ImageStyle } from "expo-image";
import { useState } from "react";
import { StyleProp } from "react-native";

type ProductImageProps = {
  path: string;
  style?: StyleProp<ImageStyle>;
};

export function ProductImage({ path, style }: ProductImageProps) {
  const [useFallback, setUseFallback] = useState(false);

  return (
    <Image
      source={{
        uri: useFallback
          ? getCloudflareImageUrl(path)
          : getSupabaseImageUrl(path),
      }}
      style={style}
      contentFit="cover"
      transition={150}
      onError={() => setUseFallback(true)}
    />
  );
}
