import { useState } from "react";
import {
  Blockchain,
  NAV_COMPONENT_TOKEN,
  toTitleCase,
} from "@coral-xyz/common";
import {
  type ProviderId,
  TokenBalances as _TokenBalances,
} from "@coral-xyz/data-components";
import { useTranslation } from "@coral-xyz/i18n";
import { useActiveWallet, useIsDevnet, useNavigation } from "@coral-xyz/recoil";
import {
  temporarilyMakeStylesForBrowserExtension,
  XStack,
  YStack,
} from "@coral-xyz/tamagui";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";

import { SkeletonRow } from "../../common/TokenTable";
import { TransferWidget } from "../Balances/TransferWidget";

import { TokenDisplayManagementDrawer } from "./TokenDisplayManagementDrawer";
export { TokenDetails } from "./TokenDetails";

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
  const { push } = useNavigation();
  const isDevnet = useIsDevnet();
  const [showDrawer, setShowDrawer] = useState(false);
  const swapEnabled = blockchain === Blockchain.SOLANA && !isDevnet;

  return (
    <>
      <_TokenBalances
        address={publicKey}
        providerId={blockchain.toUpperCase() as ProviderId}
        fetchPolicy="cache-and-network"
        onItemClick={async ({
          id,
          balance,
          displayAmount,
          symbol,
          token,
          tokenAccount,
        }) => {
          await push({
            title: `${toTitleCase(blockchain)} / ${symbol}`,
            componentId: NAV_COMPONENT_TOKEN,
            componentProps: {
              id,
              balance,
              blockchain,
              displayAmount,
              symbol: symbol || undefined,
              token,
              tokenAddress: tokenAccount,
              publicKey,
            },
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
              setShowDrawer(true);
            }}
          >
            <VisibilityOffOutlinedIcon sx={{ fontSize: 18 }} />
            <p style={{ margin: 0 }}>{t("manage_token_display")}</p>
          </XStack>
        }
        tableLoaderComponent={
          <div style={{ borderRadius: 16, width: "100%" }}>
            <YStack>
              <SkeletonRow />
              <SkeletonRow />
              <SkeletonRow />
              <SkeletonRow />
            </YStack>
          </div>
        }
        widgets={
          <div>
            <TransferWidget rampEnabled swapEnabled={swapEnabled} />
          </div>
        }
      />
      <TokenDisplayManagementDrawer
        address={publicKey}
        blockchain={blockchain}
        visible={showDrawer}
        setVisible={setShowDrawer}
      />
    </>
  );
}
