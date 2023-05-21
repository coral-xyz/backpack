import ContentLoader, { Rect } from "react-content-loader/native";

import { useCustomTheme } from "../../hooks";

export function Skeleton({
  height,
  radius,
  width,
}: {
  height?: number | string;
  radius?: number;
  width?: number | string;
}) {
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
      <Rect x="0" y="0" height={h} width={w} rx={radius} ry={radius} />
    </ContentLoader>
  );
}
