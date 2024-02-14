import {
  ContentLoader,
  Skeleton,
  useTheme,
  XStack,
  YStack,
} from "@coral-xyz/tamagui";

import { TokenDetails } from "../../../../components/Unlocked/TokenBalances/TokenDetails";
import { ScreenContainer } from "../../../components/ScreenContainer";
import type { TokensDetailScreenProps } from "../../../navigation/WalletsNavigator";

export function TokensDetailScreen(props: TokensDetailScreenProps) {
  return (
    <ScreenContainer loading={<Loading />}>
      <Container {...props} />
    </ScreenContainer>
  );
}

function Loading() {
  return (
    <YStack
      flex={1}
      alignItems="center"
      marginHorizontal={16}
      marginTop={8}
      maxWidth="100%"
      gap={20}
    >
      <XStack mb={6}>
        <IconLoading size={40} />
      </XStack>
      <Skeleton height={28} width={160} radius={8} />
      <XStack mt={-4}>
        <Skeleton height={20} width={130} radius={8} />
      </XStack>
      <XStack mb={24}>
        <WidgetLoading />
      </XStack>
      <Skeleton height={68} radius={8} />
      <Skeleton height={96} radius={8} />
    </YStack>
  );
}

function WidgetLoading() {
  const circleRadius = 22;
  const spacing = 24;
  const theme = useTheme();
  const totalWidth = 3 * circleRadius * 2 + 2 * spacing;

  const circles = Array.from({ length: 3 }).map((_, i) => {
    const cx = circleRadius + i * (circleRadius * 2 + spacing);
    return <circle key={i} cx={cx} cy={circleRadius} r={circleRadius} />;
  });

  return (
    <ContentLoader
      width={totalWidth}
      height={circleRadius * 2}
      viewBox={`0 0 ${totalWidth} ${circleRadius * 2}`}
      backgroundColor={theme.baseBackgroundL0.val}
      foregroundColor={theme.baseBackgroundL1.val}
    >
      {circles}
    </ContentLoader>
  );
}

function IconLoading({ size }: { size: number }) {
  const width = size * 2;
  const height = width;
  const theme = useTheme();
  return (
    <ContentLoader
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      backgroundColor={theme.baseBackgroundL0.val}
      foregroundColor={theme.baseBackgroundL1.val}
    >
      <circle cx={size} cy={size} r={size} />
    </ContentLoader>
  );
}

function Container({ route: { params } }: TokensDetailScreenProps) {
  return <TokenDetails {...params} />;
}
