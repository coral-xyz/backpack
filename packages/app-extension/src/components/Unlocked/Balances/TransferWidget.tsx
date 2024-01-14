import type { Blockchain } from "@coral-xyz/common";
import { useTranslation } from "@coral-xyz/i18n";
import { useTheme } from "@coral-xyz/tamagui";
import { ArrowDownward, ArrowUpward } from "@mui/icons-material";
import { useNavigation } from "@react-navigation/native";

import { Routes as RoutesSend } from "../../../refactor/navigation/SendNavigator";
import { Routes } from "../../../refactor/navigation/WalletsNavigator";

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
  blockchain: Blockchain;
  address?: string;
  publicKey: string;
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
        <SwapButton
          address={address}
          assetId={assetId}
          blockchain={blockchain}
        />
      ) : null}
    </div>
  );
}

function SendButton({
  assetId,
  blockchain,
  address: _1,
  publicKey: _2,
}: {
  assetId?: string;
  blockchain?: Blockchain;
  address?: string;
  publicKey?: string;
}) {
  const theme = useTheme();
  const { t } = useTranslation();
  const navigation = useNavigation<any>();

  const onClick = () => {
    navigation.push(Routes.SendNavigator, {
      screen: assetId
        ? RoutesSend.SendAddressSelectScreen
        : RoutesSend.SendTokenSelectScreen,
      params: assetId ? { assetId, blockchain } : undefined,
    });
  };

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
      onClick={onClick}
    />
  );
}

function ReceiveButton(_props: {
  blockchain?: Blockchain;
  publicKey?: string;
}) {
  const theme = useTheme();
  const { t } = useTranslation();
  const navigation = useNavigation<any>();

  const onClick = () => {
    navigation.push(Routes.ReceiveNavigator);
  };

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
      onClick={onClick}
    />
  );
}
