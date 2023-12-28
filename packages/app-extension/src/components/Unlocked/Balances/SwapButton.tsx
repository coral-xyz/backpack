import type { Blockchain } from "@coral-xyz/common";
import { useTranslation } from "@coral-xyz/i18n";
import { SwapProvider, useSwapContext } from "@coral-xyz/recoil";
import { useTheme } from "@coral-xyz/tamagui";
import { SwapHoriz } from "@mui/icons-material";

import { Swap, SwapSelectTokenInDrawer } from "../Swap";

import { TransferButton } from "./TransferButton";

export function SwapButton({
  blockchain,
  address,
}: {
  blockchain?: Blockchain;
  address?: string;
}) {
  return (
    <SwapProvider ctx={{}} tokenAddress={address} isInDrawer>
      <SwapButtonIfTheTokenIsSwappable
        address={address}
        blockchain={blockchain}
      />
    </SwapProvider>
  );
}

const SwapButtonComponent = ({
  isLoading,
  routes,
}: {
  isLoading: boolean;
  routes: React.ComponentProps<typeof TransferButton>["routes"];
}) => {
  const theme = useTheme();
  const { t } = useTranslation();
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
      routes={routes}
      disabled={isLoading}
    />
  );
};

const SwapButtonIfTheTokenIsSwappable = ({
  blockchain,
  address,
}: {
  blockchain?: Blockchain;
  address?: string;
}) => {
  const { canSwap, isLoading } = useSwapContext();
  const { t } = useTranslation();

  //
  // Note: if address is undefined, then we are in the main balances view.
  //       So automatically show the swap button.
  //
  return address === undefined || canSwap ? (
    <SwapButtonComponent
      isLoading={isLoading}
      routes={[
        {
          name: "swap",
          component: (props: any) => <Swap {...props} tokenAddress={address} />,
          title: t(`swap`),
          props: {
            blockchain,
          },
        },
        {
          title: t(`select_token`),
          name: "select-token",
          component: (props: any) => <SwapSelectTokenInDrawer {...props} />,
        },
      ]}
    />
  ) : // There are no Jupiter Routes for this token, so hide the button
  null;
};
