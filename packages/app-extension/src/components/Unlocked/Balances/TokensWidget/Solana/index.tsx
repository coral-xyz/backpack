import { useState } from "react";
import {
  Blockchain,
  confirmTransaction,
  getLogger,
  isCardinalWrappedToken,
  isCreatorStandardToken,
  isOpenCreatorProtocol,
  isProgrammableNftToken,
  SOL_NATIVE_MINT,
  Solana,
} from "@coral-xyz/common";
import { PrimaryButton, UserIcon } from "@coral-xyz/react-common";
import {
  useActiveWallet,
  useAvatarUrl,
  useSolanaCtx,
  useSolanaTokenMint,
} from "@coral-xyz/recoil";
import { styles, useCustomTheme } from "@coral-xyz/themes";
import { Typography } from "@mui/material";
import { PublicKey } from "@solana/web3.js";
import type { BigNumber } from "ethers";

import { CopyablePublicKey } from "../../../../common/CopyablePublicKey";
import { SettingsList } from "../../../../common/Settings/List";
import { TokenAmountHeader } from "../../../../common/TokenAmountHeader";
import { Error, Sending } from "../Send";

const logger = getLogger("send-solana-confirmation-card");

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
  const [txSignature, setTxSignature] = useState<string | null>(null);
  const solanaCtx = useSolanaCtx();
  const [error, setError] = useState(
    "Error 422. Transaction time out. Runtime error. Reticulating splines."
  );
  const [cardType, setCardType] = useState<
    "confirm" | "sending" | "complete" | "error"
  >("confirm");
  const mintInfo = useSolanaTokenMint({
    publicKey: solanaCtx.walletPublicKey.toString(),
    tokenAddress: token.address,
  });

  const onConfirm = async () => {
    setCardType("sending");
    //
    // Send the tx.
    //
    let txSig;

    try {
      const mintId = new PublicKey(token.mint?.toString() as string);
      if (token.mint === SOL_NATIVE_MINT.toString()) {
        txSig = await Solana.transferSol(solanaCtx, {
          source: solanaCtx.walletPublicKey,
          destination: new PublicKey(destinationAddress),
          amount: amount.toNumber(),
        });
      } else if (
        await isProgrammableNftToken(
          solanaCtx.connection,
          token.mint?.toString() as string
        )
      ) {
        txSig = await Solana.transferProgrammableNft(solanaCtx, {
          destination: new PublicKey(destinationAddress),
          mint: new PublicKey(token.mint!),
          amount: amount.toNumber(),
          decimals: token.decimals,
          source: new PublicKey(token.address),
        });
      }
      // Use an else here to avoid an extra request if we are transferring sol native mints.
      else {
        const ocpMintState = await isOpenCreatorProtocol(
          solanaCtx.connection,
          mintId,
          mintInfo
        );
        if (ocpMintState !== null) {
          txSig = await Solana.transferOpenCreatorProtocol(
            solanaCtx,
            {
              destination: new PublicKey(destinationAddress),
              amount: amount.toNumber(),
              mint: new PublicKey(token.mint!),
            },
            ocpMintState
          );
        } else if (isCreatorStandardToken(mintId, mintInfo)) {
          txSig = await Solana.transferCreatorStandardToken(solanaCtx, {
            destination: new PublicKey(destinationAddress),
            mint: new PublicKey(token.mint!),
            amount: amount.toNumber(),
            decimals: token.decimals,
          });
        } else if (
          await isCardinalWrappedToken(solanaCtx.connection, mintId, mintInfo)
        ) {
          txSig = await Solana.transferCardinalManagedToken(solanaCtx, {
            destination: new PublicKey(destinationAddress),
            mint: new PublicKey(token.mint!),
            amount: amount.toNumber(),
            decimals: token.decimals,
          });
        } else {
          txSig = await Solana.transferToken(solanaCtx, {
            destination: new PublicKey(destinationAddress),
            mint: new PublicKey(token.mint!),
            amount: amount.toNumber(),
            decimals: token.decimals,
          });
        }
      }
    } catch (err: any) {
      logger.error("solana transaction failed", err);
      setError(err.toString());
      setCardType("error");
      return;
    }

    setTxSignature(txSig);

    //
    // Confirm the tx.
    //
    try {
      await confirmTransaction(
        solanaCtx.connection,
        txSig,
        solanaCtx.commitment !== "confirmed" &&
          solanaCtx.commitment !== "finalized"
          ? "confirmed"
          : solanaCtx.commitment
      );
      setCardType("complete");
      if (onComplete) onComplete(txSig);
    } catch (err: any) {
      logger.error("unable to confirm", err);
      setError(err.toString());
      setCardType("error");
    }
  };

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

export function ConfirmSendSolana({
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
