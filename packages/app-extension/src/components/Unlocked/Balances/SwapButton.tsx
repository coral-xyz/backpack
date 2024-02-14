import { Blockchain } from "@coral-xyz/common";
import { useTranslation } from "@coral-xyz/i18n";
import { useTheme } from "@coral-xyz/tamagui";
import { SwapHoriz } from "@mui/icons-material";
import { useNavigation } from "@react-navigation/native";

import { Routes as SwapRoutes } from "../../../refactor/navigation/SwapNavigator";
import { Routes } from "../../../refactor/navigation/WalletsNavigator";

import { TransferButton } from "./TransferButton";

export function SwapButton({
  address,
  assetId,
  blockchain,
}: {
  address?: string;
  assetId?: string;
  blockchain: Blockchain;
}) {
  return (
    <SwapButtonIfTheTokenIsSwappable
      address={address}
      blockchain={blockchain}
      assetId={assetId}
    />
  );
}

const SwapButtonComponent = ({
  isLoading,
  assetId,
}: {
  isLoading: boolean;
  assetId?: string;
}) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const navigation = useNavigation<any>();

  const onClick = () => {
    navigation.push(Routes.SwapNavigator, {
      screen: SwapRoutes.SwapScreen,
      params: { assetId },
    });
  };

  return (
    <TransferButton
      label={t("swap")}
      labelComponent={
        <SwapHoriz
          style={{
            color: theme.accentBlue.val,
            display: "flex",
            marginLeft: "auto",
            marginRight: "auto",
          }}
        />
      }
      onClick={onClick}
      disabled={isLoading}
    />
  );
};

const SwapButtonIfTheTokenIsSwappable = ({
  blockchain,
  address,
  assetId,
}: {
  blockchain?: Blockchain;
  address?: string;
  assetId?: string;
}) => {
  const canSwap = blockchain === Blockchain.SOLANA;

  //
  // Note: if address is undefined, then we are in the main balances view.
  //       So automatically show the swap button.
  //
  return address === undefined || canSwap ? (
    <SwapButtonComponent isLoading={false} assetId={assetId} />
  ) : // There are no Jupiter Routes for this token, so hide the button
  null;
};
