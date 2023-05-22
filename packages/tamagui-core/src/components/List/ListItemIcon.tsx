import { proxyImageUrl } from "@coral-xyz/common";
import { Avatar } from "tamagui";

import { Skeleton } from "../Skeleton";

export type ListItemIconCoreProps = {
  image: string;
  size: number;
};

export function ListItemIconCore({ image, size }: ListItemIconCoreProps) {
  const proxySrc = proxyImageUrl(image);
  return (
    <Avatar circular size={size}>
      <Avatar.Image src={proxySrc} />
      <Avatar.Fallback delayMs={250}>
        <Skeleton height={size} width={size} radius={size / 2} />
      </Avatar.Fallback>
    </Avatar>
  );
}
