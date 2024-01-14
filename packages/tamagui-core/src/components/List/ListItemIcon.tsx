import type { ColorTokens, RadiusTokens, SizeTokens } from "@tamagui/core";

import { proxyImageUrl } from "@coral-xyz/common";
import { Avatar, type AvatarProps } from "tamagui";

import { Skeleton } from "../Skeleton";

export type ListItemIconCoreProps = {
  image?: string;
  radius?: RadiusTokens;
  size: SizeTokens;
  style?: Omit<AvatarProps, "children">;
  borderColor?: ColorTokens;
};

export function ListItemIconCore({
  image,
  radius,
  size,
  style,
  borderColor,
}: ListItemIconCoreProps) {
  const proxySrc = image ? proxyImageUrl(image, 100) : undefined;
  return (
    <Avatar
      borderRadius={radius}
      borderColor={borderColor}
      size={size}
      {...style}
    >
      <Avatar.Image src={proxySrc} />
      <Avatar.Fallback>
        <Skeleton height={size} width={size} />
      </Avatar.Fallback>
    </Avatar>
  );
}
