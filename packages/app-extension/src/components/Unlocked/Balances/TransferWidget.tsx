import type { Blockchain } from "@coral-xyz/common";
import { useTranslation } from "@coral-xyz/i18n";
import {
  ETH_NATIVE_MINT,
  SOL_NATIVE_MINT,
} from "@coral-xyz/secure-clients/legacyCommon";
import { useTheme } from "@coral-xyz/tamagui";
import { ArrowDownward, ArrowUpward } from "@mui/icons-material";

import { useNavigation } from "../../common/Layout/NavStack";
import type { Token } from "../../common/TokenTable";
import { SearchableTokenTables } from "../../common/TokenTable";

import {
  AddressSelectorLoader,
  TokenAddressSelector,
} from "./TokensWidget/AddressSelector";
import { Deposit } from "./TokensWidget/Deposit";
import { Send } from "./TokensWidget/Send";
import { SwapButton } from "./SwapButton";
import { TransferButton } from "./TransferButton";

export function TransferWidget({
  assetId,
  blockchain,
  address,
  publicKey,
  swapEnabled,
}: {
  assetId?: string;
  blockchain?: Blockchain;
  address?: string;
  publicKey?: string;
  rampEnabled: boolean;
  swapEnabled: boolean;
}) {
  return (
    <div
      style={{
        display: "flex",
        marginLeft: "auto",
        marginRight: "auto",
        justifyContent: "center",
        gap: "16px",
      }}
    >
      <ReceiveButton blockchain={blockchain} publicKey={publicKey} />
      <SendButton
        assetId={assetId}
        blockchain={blockchain}
        address={address}
        publicKey={publicKey}
      />
      {swapEnabled ? (
        <SwapButton blockchain={blockchain} address={address} />
      ) : null}
    </div>
  );
}

function SendButton({
  assetId,
  blockchain,
  address,
  publicKey,
}: {
  assetId?: string;
  blockchain?: Blockchain;
  address?: string;
  publicKey?: string;
}) {
  const theme = useTheme();
  const { t } = useTranslation();

  return (
    <TransferButton
      label={t("send")}
      labelComponent={
        <ArrowUpward
          style={{
            color: theme.accentBlue.val,
            display: "flex",
            marginLeft: "auto",
            marginRight: "auto",
          }}
        />
      }
      routes={
        blockchain && address
          ? [
              {
                name: "select-user",
                component: (props: any) => <AddressSelectorLoader {...props} />,
                title: "",
                props: {
                  assetId,
                  address,
                  blockchain,
                  publicKey,
                },
              },
              {
                name: "send",
                component: (props: any) => <Send {...props} />,
                title: t("send"),
              },
            ]
          : [
              {
                name: "select-token",
                component: SendToken,
                title: t("select_token"),
              },
              {
                name: "select-user",
                component: (props: any) => <TokenAddressSelector {...props} />,
                title: "",
              },
              {
                name: "send",
                component: (props: any) => <Send {...props} />,
                title: "",
              },
            ]
      }
    />
  );
}

function ReceiveButton({
  blockchain,
  publicKey,
}: {
  blockchain?: Blockchain;
  publicKey?: string;
}) {
  const theme = useTheme();
  const { t } = useTranslation();
  return (
    <TransferButton
      label={t("receive")}
      labelComponent={
        <ArrowDownward
          style={{
            color: theme.accentBlue.val,
            display: "flex",
            marginLeft: "auto",
            marginRight: "auto",
          }}
        />
      }
      routes={[
        {
          component: Deposit,
          title: t("deposit"),
          name: "deposit",
          props: {
            blockchain,
            publicKey,
          },
        },
      ]}
    />
  );
}

function SendToken() {
  const { push } = useNavigation();

  const onClickRow = (blockchain: Blockchain, token: Token) => {
    push("select-user", { blockchain, token, name: token.ticker });
  };

  return (
    <SearchableTokenTables
      onClickRow={onClickRow}
      customFilter={(token: Token) => {
        if (token.mint && token.mint === SOL_NATIVE_MINT) {
          return true;
        }
        if (token.address && token.address === ETH_NATIVE_MINT) {
          return true;
        }
        return !token.nativeBalance.isZero();
      }}
    />
  );
}
