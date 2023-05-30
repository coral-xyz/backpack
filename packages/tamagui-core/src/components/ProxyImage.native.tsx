import { proxyImageUrl } from "@coral-xyz/common";
import type { ImageProps, ImageStyle } from "expo-image";
import { Image } from "expo-image";

// React Native apps need to specifcy a width and height for remote images
export const ProxyImage = ({
  transition,
  placeholder,
  contentFit,
  src,
  size,
  style,
}: ImageProps & {
  src: string;
  size: number;
  style?: ImageStyle;
}): JSX.Element => {
  const uri = proxyImageUrl(src, size);
  return (
    <Image
      transition={transition}
      contentFit={contentFit}
      placeholder={placeholder}
      style={style}
      source={uri}
    />
  );
};
