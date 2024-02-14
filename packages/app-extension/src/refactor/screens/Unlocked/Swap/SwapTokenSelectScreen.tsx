import { Blockchain } from "@coral-xyz/common";
import {
  type CachedTokenBalance,
  useCachedTokenBalances,
  useSolanaCtx,
  useSwapContext,
  useSwapOutputTokens,
  useSwapValidInputTokens,
} from "@coral-xyz/recoil";
import { SOL_NATIVE_MINT } from "@coral-xyz/secure-clients/legacyCommon";
import { useTheme, XStack, YStack } from "@coral-xyz/tamagui";
import { Skeleton } from "@mui/material";
import { useNavigation } from "@react-navigation/native";

import type { TokenTableBalance } from "../../../../components/common/TokenTable";
import { SearchableTokenTable } from "../../../../components/common/TokenTable";
import { TokenBalanceTableLoader } from "../../../../components/Unlocked/TokenBalances";
import { ScreenContainer } from "../../../components/ScreenContainer";
import type { SwapTokenSelectScreenProps } from "../../../navigation/SwapNavigator";

export function SwapTokenSelectScreen(props: SwapTokenSelectScreenProps) {
  return (
    <ScreenContainer loading={<Loading />}>
      <Container {...props} />
    </ScreenContainer>
  );
}

function Container({ route }: SwapTokenSelectScreenProps) {
  const { input, isFromMint } = route.params;
  return <SwapSelectToken input={input} isFromMint={isFromMint} />;
}

function Loading() {
  const theme = useTheme();
  return (
    <YStack
      height="100%"
      space="$3"
      style={{ paddingLeft: 18, paddingRight: 18 }}
    >
      <XStack jc="center">
        <Skeleton
          height={46}
          width={339}
          style={{
            backgroundColor: theme.baseBackgroundL1.val,
            borderRadius: 8,
          }}
        />
      </XStack>
      <TokenBalanceTableLoader />
    </YStack>
  );
}

function SwapSelectToken({
  input,
  isFromMint,
}: {
  input: boolean;
  isFromMint: boolean;
}) {
  const { walletPublicKey } = useSolanaCtx();
  const nav = useNavigation<any>();
  const { setFrom, setTo } = useSwapContext();
  const setMint = isFromMint ? setFrom : setTo;

  const onClickRow = (
    _blockchain: Blockchain,
    token: CachedTokenBalance | TokenTableBalance
  ) => {
    setMint({
      walletPublicKey: walletPublicKey.toString(),
      mint: token.token,
      blockchain: Blockchain.SOLANA,
    });
    nav.pop();
  };

  return input ? (
    <FromTokenTable onClickRow={onClickRow} />
  ) : (
    <ToTokenTable onClickRow={onClickRow} />
  );
}

function FromTokenTable({ onClickRow }: { onClickRow: any }) {
  const { from, to } = useSwapContext();
  const { balances: fromBalances } = useCachedTokenBalances(from);
  const [fromTokens, isLoadingFromTokens] = useSwapValidInputTokens({
    fromBalances,
    from,
    to,
  });

  if (isLoadingFromTokens) {
    return <Loading />;
  }

  return <SearchableTokenTable onClickRow={onClickRow} tokens={fromTokens} />;
}

function ToTokenTable({ onClickRow }: { onClickRow: any }) {
  const { from, to } = useSwapContext();
  // If there's a to already selected, use that wallet and blockchain.
  // If it's not selected, then we just assume it's a simple wallet swap.
  const { balances: outputBalances } = useCachedTokenBalances(to ?? from);
  const [toTokens, isLoadingToTokens] = useSwapOutputTokens({
    from,
    to,
    outputBalances,
  });

  if (isLoadingToTokens) {
    return <Loading />;
  }

  // Need to convert SOL here because the wallet uses a different
  // internal representation of native sol vs the gql api server.
  const fromMint =
    from.mint === SOL_NATIVE_MINT
      ? "So11111111111111111111111111111111111111112"
      : from.mint;
  const filteredToTokens = toTokens.filter((t) => t.token !== fromMint);
  return (
    <SearchableTokenTable onClickRow={onClickRow} tokens={filteredToTokens} />
  );
}
