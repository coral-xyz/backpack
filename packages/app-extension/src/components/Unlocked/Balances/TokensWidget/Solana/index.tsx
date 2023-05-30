import { Blockchain } from "@coral-xyz/common";
import { PrimaryButton, UserIcon } from "@coral-xyz/react-common";
import {
  useActiveWallet,
  useAvatarUrl,
  useSolanaCtx,
  useSolanaTransaction,
} from "@coral-xyz/recoil";
import { styles, useCustomTheme } from "@coral-xyz/themes";
import { Typography } from "@mui/material";
import type { BigNumber } from "ethers";

import { CopyablePublicKey } from "../../../../common/CopyablePublicKey";
import { SettingsList } from "../../../../common/Settings/List";
import { TokenAmountHeader } from "../../../../common/TokenAmountHeader";
import { Error, Sending } from "../Send";

const useStyles = styles((theme) => ({
  confirmTableListItem: {
    backgroundColor: `${theme.custom.colors.approveTransactionTableBackground} !important`,
    "&:hover": {
      opacity: 1,
    },
  },
}));

export function SendSolanaConfirmationCard({
  token,
  destinationAddress,
  destinationUser,
  amount,
  onComplete,
  onViewBalances,
}: {
  token: {
    address: string;
    logo: string;
    decimals: number;
    tokenId?: string;
    mint?: string;
  };
  destinationAddress: string;
  destinationUser?: {
    username: string;
    walletName?: string;
    image: string;
  };
  amount: BigNumber;
  onComplete?: (txSig?: any) => void;
  onViewBalances?: () => void;
}) {
  const { txSignature, onConfirm, cardType, error } = useSolanaTransaction({
    token,
    destinationAddress,
    amount,
    onComplete: (txid) => {
      onComplete?.(txid);
    },
  });

  return (
    <>
      {cardType === "confirm" ? (
        <ConfirmSendSolana
          token={token}
          destinationAddress={destinationAddress}
          destinationUser={destinationUser}
          amount={amount}
          onConfirm={onConfirm}
        />
      ) : cardType === "sending" ? (
        <Sending
          blockchain={Blockchain.SOLANA}
          isComplete={false}
          amount={amount}
          token={token}
          signature={txSignature!}
        />
      ) : cardType === "complete" ? (
        <Sending
          blockchain={Blockchain.SOLANA}
          isComplete
          amount={amount}
          token={token}
          signature={txSignature!}
          onViewBalances={onViewBalances}
        />
      ) : (
        <Error
          blockchain={Blockchain.SOLANA}
          signature={txSignature!}
          onRetry={onConfirm}
          error={error}
        />
      )}
    </>
  );
}

function ConfirmSendSolana({
  token,
  destinationAddress,
  amount,
  onConfirm,
  destinationUser,
}: {
  token: {
    logo?: string;
    ticker?: string;
    decimals: number;
  };
  destinationAddress: string;
  amount: BigNumber;
  onConfirm: () => void;
  destinationUser?: {
    username: string;
    image: string;
  };
}) {
  const theme = useCustomTheme();
  return (
    <div
      style={{
        padding: "16px",
        height: "402px",
        display: "flex",
        justifyContent: "space-between",
        flexDirection: "column",
        paddingBottom: "24px",
      }}
    >
      <div>
        <Typography
          style={{
            color: theme.custom.colors.fontColor,
            fontWeight: 500,
            fontSize: "18px",
            lineHeight: "24px",
            textAlign: "center",
          }}
        >
          Review Send
        </Typography>
        <TokenAmountHeader
          style={{
            marginTop: "40px",
            marginBottom: "40px",
          }}
          amount={amount}
          token={token}
        />
        <ConfirmSendSolanaTable
          destinationUser={destinationUser}
          destinationAddress={destinationAddress}
        />
      </div>
      <PrimaryButton
        onClick={() => onConfirm()}
        label="Send"
        type="submit"
        data-testid="Send"
      />
    </div>
  );
}

const ConfirmSendSolanaTable: React.FC<{
  destinationAddress: string;
  destinationUser?: { username: string; image: string; walletName?: string };
}> = ({ destinationAddress, destinationUser }) => {
  const theme = useCustomTheme();
  const classes = useStyles();
  const solanaCtx = useSolanaCtx();
  const avatarUrl = useAvatarUrl();
  const wallet = useActiveWallet();

  const menuItems = {
    From: {
      onClick: () => {},
      detail: (
        <div style={{ display: "flex", alignItems: "center" }}>
          <UserIcon marginRight={5} image={avatarUrl} size={24} />
          <Typography variant="body2" style={{ marginRight: 5 }}>
            {wallet.name}
          </Typography>
          <CopyablePublicKey publicKey={solanaCtx.walletPublicKey} />
        </div>
      ),
      classes: { root: classes.confirmTableListItem },
      button: false,
    },
    To: {
      onClick: () => {},
      detail: (
        <div style={{ display: "flex", alignItems: "center" }}>
          {destinationUser ? (
            <>
              <UserIcon
                marginRight={5}
                image={destinationUser.image}
                size={24}
              />
              <Typography variant="body2" style={{ marginRight: 5 }}>
                {destinationUser.walletName
                  ? destinationUser.walletName
                  : `@${destinationUser.username}`}
              </Typography>
            </>
          ) : null}
          <CopyablePublicKey publicKey={destinationAddress} />
        </div>
      ),
      classes: { root: classes.confirmTableListItem },
      button: false,
    },
    "Network fee": {
      onClick: () => {},
      detail: (
        <Typography>
          0.000005{" "}
          <span style={{ color: theme.custom.colors.secondary }}>SOL</span>
        </Typography>
      ),
      classes: { root: classes.confirmTableListItem },
      button: false,
    },
  } satisfies React.ComponentProps<typeof SettingsList>["menuItems"];

  return (
    <SettingsList
      borderColor={theme.custom.colors.approveTransactionTableBackground}
      menuItems={menuItems}
      style={{
        margin: 0,
      }}
      textStyle={{
        color: theme.custom.colors.secondary,
      }}
    />
  );
};
