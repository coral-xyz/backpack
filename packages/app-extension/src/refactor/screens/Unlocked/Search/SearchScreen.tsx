import { useTheme, XStack,YStack } from "@coral-xyz/tamagui";
import { Skeleton } from "@mui/material";

import { _XnftAppStack } from "../../../../components/common/Layout/XnftAppStack";
import { AppGridSkeleton } from "../../../../components/Unlocked/Apps";
import { Spotlight } from "../../../../spotlight/Spotlight";
import { ScreenContainer } from "../../../components/ScreenContainer";
import type { SearchScreenProps } from "../../../navigation/WalletsNavigator";

export function SearchScreen(props: SearchScreenProps) {
  return (
    <ScreenContainer loading={<Loading />}>
      <Container {...props} />
    </ScreenContainer>
  );
}

function Loading() {
  const theme = useTheme();
  return (
    <YStack bg="$baseBackgroundL0" height="100%" pl={16} pr={16} space={18}>
      <Skeleton
        height={56}
        sx={{
          background: theme.baseBackgroundL1.val,
          borderRadius: "12px",
        }}
      />
      <XStack pl={6} pr={6}>
        <AppGridSkeleton />
      </XStack>
    </YStack>
  );
}

function Container({ route: { params: _ } }: SearchScreenProps) {
  return <Spotlight />;
}
