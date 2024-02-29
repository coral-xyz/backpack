import { proxyImageUrl } from "@coral-xyz/common";
import {
  Image,
  type ImageProps,
  type ImageStyle,
  type StyleProp,
} from "react-native";

// React Native apps need to specify a width and height for remote images
export const ProxyImage = ({
  onError,
  src,
  size,
  style,
}: {
  onError?: ImageProps["onError"];
  placeholder?: string;
  src: string;
  size: number;
  style?: StyleProp<ImageStyle>;
}): JSX.Element => {
  const uri = proxyImageUrl(src, size);
  return <Image onError={onError} style={style} source={{ uri }} />;
};
