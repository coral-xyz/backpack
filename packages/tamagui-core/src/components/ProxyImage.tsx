import { Image, type ImageStyle, type StyleProp } from "react-native";
import { proxyImageUrl } from "@coral-xyz/common";

// React Native apps need to specifcy a width and height for remote images
export const ProxyImage = ({
  src,
  size,
  style,
}: {
  placeholder?: string;
  src: string;
  size: number;
  style?: StyleProp<ImageStyle>;
}): JSX.Element => {
  const uri = proxyImageUrl(src, size);
  return <Image style={style} source={{ uri }} />;
};
