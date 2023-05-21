import { Image, type ImageStyle, type StyleProp } from "react-native";
import { proxyImageUrl } from "@coral-xyz/common";

// React Native apps need to specifcy a width and height for remote images
export function ProxyImage({
  src,
  style,
}: {
  src: string;
  style?: StyleProp<ImageStyle>;
}): JSX.Element {
  const uri = proxyImageUrl(src);
  return <Image style={style} source={{ uri }} />;
}
