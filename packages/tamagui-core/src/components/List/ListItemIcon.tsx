import { proxyImageUrl } from "@coral-xyz/common";
import type { RadiusTokens, SizeTokens } from "@tamagui/core";
import { Avatar, type AvatarProps } from "tamagui";

import { Skeleton } from "../Skeleton";

export type ListItemIconCoreProps = {
  image?: string;
  radius?: RadiusTokens;
  size: SizeTokens;
  style?: Omit<AvatarProps, "children">;
};

export function ListItemIconCore({
  image,
  radius,
  size,
  style,
}: ListItemIconCoreProps) {
  const proxySrc = image ? proxyImageUrl(image) : undefined;
  return (
    <Avatar borderRadius={radius} size={size} {...style}>
      <Avatar.Image src={proxySrc} />
      <Avatar.Fallback>
        <Skeleton height={size} width={size} />
      </Avatar.Fallback>
    </Avatar>
  );
}
