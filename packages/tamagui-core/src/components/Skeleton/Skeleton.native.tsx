import type { SkeletonProps } from "./types";

import ContentLoader, { Rect } from "react-content-loader/native";
import { useTheme } from "tamagui";

export function Skeleton({ height, radius, width }: SkeletonProps) {
  const theme = useTheme();
  const h = height ?? "100%";
  const w = width ?? "100%";

  return (
    <ContentLoader
      speed={2}
      height={h}
      width={w}
      backgroundColor={theme.baseBackgroundL1.val}
      foregroundColor={theme.baseBackgroundL0.val}
    >
      <Rect x="0" y="0" height={h} width={w} rx={radius} ry={radius} />
    </ContentLoader>
  );
}
