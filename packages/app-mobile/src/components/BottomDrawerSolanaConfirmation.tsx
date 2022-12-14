import { useState } from "react";
import { Text } from "react-native";
import { programs, tryGetAccount } from "@cardinal/token-manager";
import { PrimaryButton, TokenAmountHeader } from "@components";
import { Error, Sending } from "@components/BottomDrawerCards";
import {
  Blockchain,
  confirmTransaction,
  getLogger,
  SOL_NATIVE_MINT,
  Solana,
  walletAddressDisplay,
} from "@coral-xyz/common";
import { useSolanaCtx } from "@coral-xyz/recoil";
import { useTheme } from "@hooks";
import { SettingsList } from "@screens/Unlocked/Settings/components/SettingsMenuList";
import type { Connection } from "@solana/web3.js";
import { PublicKey } from "@solana/web3.js";
import type { BigNumber } from "ethers";

const logger = getLogger("send-solana-confirmation-card");

export function SendSolanaConfirmationCard({
  token,
  destinationAddress,
  amount,
  onComplete,
}: {
  token: {
    address: string;
    logo: string;
    decimals: number;
    tokenId?: string;
    mint?: string;
  };
  destinationAddress: string;
  amount: BigNumber;
  onComplete?: () => void;
}) {
  const [txSignature, setTxSignature] = useState<string | null>(null);
  const solanaCtx = useSolanaCtx();
  const [error, setError] = useState(
    "Error 422. Transaction time out. Runtime error. Reticulating splines."
  );
  const [cardType, setCardType] = useState<
    "confirm" | "sending" | "complete" | "error"
  >("confirm");

  const onConfirm = async () => {
    setCardType("sending");
    //
    // Send the tx.
    //
    let txSig;
    try {
      if (token.mint === SOL_NATIVE_MINT.toString()) {
        txSig = await Solana.transferSol(solanaCtx, {
          source: solanaCtx.walletPublicKey,
          destination: new PublicKey(destinationAddress),
          amount: amount.toNumber(),
        });
      } else if (
        await isCardinalWrappedToken(
          solanaCtx.connection,
          token.mint?.toString() as string
        )
      ) {
        txSig = await Solana.transferCardinalToken(solanaCtx, {
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
      if (onComplete) onComplete();
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
          isComplete={true}
          amount={amount}
          token={token}
          signature={txSignature!}
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
}: {
  token: {
    logo?: string;
    ticker?: string;
    decimals: number;
  };
  destinationAddress: string;
  amount: BigNumber;
  onConfirm: () => void;
}) {
  const theme = useTheme();
  return (
    <div
      style={{
        padding: 16,
        height: 402,
        display: "flex",
        justifyContent: "space-between",
        flexDirection: "column",
        paddingBottom: 24,
      }}
    >
      <div>
        <Text
          style={{
            color: theme.custom.colors.fontColor,
            fontWeight: "500",
            fontSize: 18,
            lineHeight: 24,
            textAlign: "center",
          }}
        >
          Review Send
        </Text>
        <TokenAmountHeader
          style={{
            marginTop: 40,
            marginBottom: 40,
          }}
          amount={amount}
          token={token}
        />
        <ConfirmSendSolanaTable destinationAddress={destinationAddress} />
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
}> = ({ destinationAddress }) => {
  const theme = useTheme();
  const solanaCtx = useSolanaCtx();

  const menuItems = {
    From: {
      onPress: () => {},
      detail: <Text>{walletAddressDisplay(solanaCtx.walletPublicKey)}</Text>,
      // classes: { root: classes.confirmTableListItem },
      // button: false,
    },
    To: {
      onPress: () => {},
      detail: <Text>{walletAddressDisplay(destinationAddress)}</Text>,
      // classes: { root: classes.confirmTableListItem },
      // button: false,
    },
    "Network fee": {
      onPress: () => {},
      detail: (
        <Text>
          0.000005{" "}
          <span style={{ color: theme.custom.colors.secondary }}>SOL</span>
        </Text>
      ),
      // classes: { root: classes.confirmTableListItem },
      // button: false,
    },
  };

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

// TODO(peter) share between mobile/extension
const isCardinalWrappedToken = async (
  connection: Connection,
  tokenAddress: string
) => {
  const [tokenManagerId] =
    await programs.tokenManager.pda.findTokenManagerAddress(
      new PublicKey(tokenAddress)
    );
  const tokenManagerData = await tryGetAccount(() =>
    programs.tokenManager.accounts.getTokenManager(connection, tokenManagerId)
  );
  if (tokenManagerData?.parsed && tokenManagerData?.parsed.transferAuthority) {
    try {
      programs.transferAuthority.accounts.getTransferAuthority(
        connection,
        tokenManagerData?.parsed.transferAuthority
      );
      return true;
    } catch (error) {
      console.log("Invalid transfer authority");
    }
  }
  return false;
};
