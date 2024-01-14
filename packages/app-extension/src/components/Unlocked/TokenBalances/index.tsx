import { Blockchain } from "@coral-xyz/common";
import {
  type ProviderId,
  TokenBalances as _TokenBalances,
} from "@coral-xyz/data-components";
import { useTranslation } from "@coral-xyz/i18n";
import { useActiveWallet, useIsDevnet } from "@coral-xyz/recoil";
import {
  temporarilyMakeStylesForBrowserExtension,
  XStack,
  YStack,
} from "@coral-xyz/tamagui";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";

import { SkeletonRow } from "../../common/TokenTable";
import { TransferWidget } from "../Balances/TransferWidget";

export { TokenDetails } from "./TokenDetails";
import { useNavigation } from "@react-navigation/native";

import { Routes } from "../../../refactor/navigation/WalletsNavigator";

const useStyles = temporarilyMakeStylesForBrowserExtension((theme) => ({
  settings: {
    color: theme.baseTextMedEmphasis.val,
    "&:hover": {
      color: theme.accentBlue.val,
    },
  },
}));

export function TokenBalances() {
  const { t } = useTranslation();
  const classes = useStyles();
  const { publicKey, blockchain } = useActiveWallet();
  const navigation = useNavigation<any>();
  const isDevnet = useIsDevnet();
  const swapEnabled = blockchain === Blockchain.SOLANA && !isDevnet;

  return (
    <_TokenBalances
      address={publicKey}
      providerId={blockchain.toUpperCase() as ProviderId}
      fetchPolicy="cache-and-network"
      onItemClick={async ({
          id,
          displayAmount,
          symbol,
          token,
          tokenAccount,
        }) => {
          navigation.push(Routes.TokensDetailScreen, {
            id,
            displayAmount,
            symbol: symbol,
            token,
            tokenAddress: tokenAccount,
          });
        }}
      tableFooterComponent={
        <XStack
          className={classes.settings}
          ai="center"
          alignSelf="center"
          cursor="pointer"
          gap={4}
          jc="center"
          marginTop={12}
          marginBottom={8}
          maxWidth="fit-content"
          onPress={() => {
              navigation.push(Routes.TokensDisplayManagementScreen);
            }}
          >
          <VisibilityOffOutlinedIcon sx={{ fontSize: 18 }} />
          <p style={{ margin: 0 }}>{t("manage_token_display")}</p>
        </XStack>
        }
      tableLoaderComponent={<TokenBalanceTableLoader />}
      widgets={
        <div>
          <TransferWidget
            rampEnabled
            blockchain={blockchain}
            publicKey={publicKey}
            swapEnabled={swapEnabled}
            />
        </div>
        }
      />
  );
}

export function TokenBalanceTableLoader() {
  return (
    <div style={{ borderRadius: 16, width: "100%" }}>
      <YStack>
        <SkeletonRow />
        <SkeletonRow />
        <SkeletonRow />
        <SkeletonRow />
      </YStack>
    </div>
  );
}
