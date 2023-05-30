// TODO: remove the following line
/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import { Blockchain, Ethereum, getLogger } from "@coral-xyz/common";
import { PrimaryButton, UserIcon } from "@coral-xyz/react-common";
import {
  useActiveWallet,
  useAvatarUrl,
  useEthereumCtx,
  useTransactionData,
} from "@coral-xyz/recoil";
import { useCustomTheme } from "@coral-xyz/themes";
import type { UnsignedTransaction } from "@ethersproject/transactions";
import { Typography } from "@mui/material";
import type { BigNumber } from "ethers";
import { ethers } from "ethers";

import { CopyablePublicKey } from "../../../../common/CopyablePublicKey";
import { TokenAmountHeader } from "../../../../common/TokenAmountHeader";
import { TransactionData } from "../../../../common/TransactionData";
import { Error, Sending } from "../Send";

const logger = getLogger("send-ethereum-confirmation-card");
const { base58: bs58 } = ethers.utils;

export function SendEthereumConfirmationCard({
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
    // For ERC721 sends
    tokenId?: string;
  };
  destinationUser?: {
    username: string;
    image: string;
  };
  destinationAddress: string;
  amount: BigNumber;
  onComplete?: () => void;
  onViewBalances?: () => void;
}) {
  const ethereumCtx = useEthereumCtx();
  const [txSignature, setTxSignature] = useState<string | null>(null);
  const [error] = useState(
    "Error 422. Transaction time out. Runtime error. Reticulating splines."
  );
  const [transaction, setTransaction] = useState<UnsignedTransaction | null>(
    null
  );
  const [cardType, setCardType] = useState<
    "confirm" | "sending" | "complete" | "error"
  >("confirm");

  // The transaction to be executed when the Send action is confirmed. We pass
  // the full transaction to the ConfirmSendEtherem component so it can use it
  // to estimate the gas/network fees required to execute. The
  // ConfirmSendEthereum component may modify the transaction overrides (i.e.
  // gas limits, etc) before returning it to this component foe execution in
  // onConfirm().
  useEffect(() => {
    (async () => {
      let transaction;
      if (token.address === ethers.constants.AddressZero) {
        // Zero address token is native ETH
        transaction = await Ethereum.transferEthTransaction(ethereumCtx, {
          to: destinationAddress,
          value: amount.toString(),
        });
      } else if (token.tokenId) {
        // Token has a tokenId, must be an ERC721 token
        transaction = await Ethereum.transferErc721Transaction(ethereumCtx, {
          to: destinationAddress,
          from: ethereumCtx.walletPublicKey,
          contractAddress: token.address!,
          tokenId: token.tokenId,
        });
      } else {
        // Otherwise assume it is an ERC20 token
        transaction = await Ethereum.transferErc20Transaction(ethereumCtx, {
          to: destinationAddress,
          contractAddress: token.address!,
          amount: amount.toString(),
        });
      }
      setTransaction(transaction);
    })();
  }, []);

  const onConfirm = async (transactionToSend: UnsignedTransaction) => {
    setTransaction(transactionToSend);
    const _txSignature = await Ethereum.signAndSendTransaction(
      ethereumCtx,
      transactionToSend
    );
    setCardType("sending");
    setTxSignature(_txSignature);
    //
    // Confirm the tx.
    //
    try {
      // Wait for mining
      await ethereumCtx.provider.waitForTransaction(_txSignature);
      // Grab the transaction
      const transaction = await ethereumCtx.provider.getTransaction(
        _txSignature
      );
      // We already waited, but calling .wait will throw if the transaction failed
      await transaction.wait();
      setCardType("complete");
      if (onComplete) onComplete();
    } catch (err) {
      logger.error("ethereum transaction failed", err);
      setCardType("error");
    }
  };

  if (!transaction) {
    // TODO loader
    return null;
  }

  const retry = () => onConfirm(transaction);

  return (
    <div>
      {cardType === "confirm" ? (
        <ConfirmSendEthereum
          token={token}
          destinationAddress={destinationAddress}
          destinationUser={destinationUser}
          transaction={transaction}
          amount={amount}
          onConfirm={onConfirm}
        />
      ) : cardType === "sending" ? (
        <Sending
          blockchain={Blockchain.ETHEREUM}
          isComplete={false}
          amount={amount}
          token={token}
          signature={txSignature!}
        />
      ) : cardType === "complete" ? (
        <Sending
          blockchain={Blockchain.ETHEREUM}
          isComplete
          amount={amount}
          token={token}
          signature={txSignature!}
          onViewBalances={onViewBalances}
        />
      ) : (
        <Error
          blockchain={Blockchain.ETHEREUM}
          signature={txSignature!}
          onRetry={() => retry()}
          error={error}
        />
      )}
    </div>
  );
}

function ConfirmSendEthereum({
  token,
  destinationAddress,
  amount,
  transaction,
  onConfirm,
  destinationUser,
}: {
  token: {
    address?: string;
    logo?: string;
    ticker?: string;
    decimals: number;
  };
  destinationAddress: string;
  destinationUser?: { image: string; username: string };
  amount: BigNumber;
  transaction: UnsignedTransaction;
  onConfirm: (transactionToSend: UnsignedTransaction) => void;
}) {
  const theme = useCustomTheme();
  const transactionData = useTransactionData(
    Blockchain.ETHEREUM,
    bs58.encode(ethers.utils.serializeTransaction(transaction))
  );
  const avatarUrl = useAvatarUrl();
  const wallet = useActiveWallet();

  const { from, loading, transaction: transactionToSend } = transactionData;

  const menuItems = {
    From: {
      onClick: () => {},
      detail: (
        <div style={{ display: "flex", alignItems: "center" }}>
          <UserIcon marginRight={5} image={avatarUrl} size={24} />
          <Typography variant="body2" style={{ marginRight: 5 }}>
            {wallet.name}
          </Typography>
          <CopyablePublicKey publicKey={from} />
        </div>
      ),
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
                @{destinationUser.username}
              </Typography>
            </>
          ) : null}
          <CopyablePublicKey publicKey={destinationAddress} />
        </div>
      ),
      button: false,
    },
  };

  return (
    <div
      style={{
        padding: "16px",
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
        <TransactionData
          transactionData={transactionData}
          menuItems={menuItems}
        />
      </div>
      <PrimaryButton
        disabled={loading}
        style={{ marginTop: "16px" }}
        onClick={() =>
          onConfirm(
            ethers.utils.parseTransaction(bs58.decode(transactionToSend))
          )
        }
        label="Send"
        type="submit"
        data-testid="Send"
      />
    </div>
  );
}
