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
  // TODO.
  return null;
}

function Container({ route: { params } }: TokensDetailScreenProps) {
  return <TokenDetails {...params} />;
}
