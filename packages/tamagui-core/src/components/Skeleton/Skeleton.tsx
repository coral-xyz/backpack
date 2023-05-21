import ContentLoader from "react-content-loader";

import { useCustomTheme } from "../../hooks";

import type { SkeletonProps } from "./types";

export function Skeleton({ height, radius, width }: SkeletonProps) {
  const theme = useCustomTheme();
  const h = height ?? "100%";
  const w = width ?? "100%";

  return (
    <ContentLoader
      speed={2}
      height={h}
      width={w}
      backgroundColor={theme.custom.colors.balanceSkeleton}
      foregroundColor={theme.custom.colors.balanceSkeletonForeground}
    >
      <rect x="0" y="0" height={h} width={w} rx={radius} ry={radius} />
    </ContentLoader>
  );
}
