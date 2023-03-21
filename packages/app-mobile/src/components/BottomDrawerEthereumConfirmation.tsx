import type { UnsignedTransaction } from "@ethersproject/transactions";
import type { BigNumber } from "ethers";

import { useEffect, useState } from "react";
import { Text } from "react-native";

import {
  Blockchain,
  Ethereum,
  getLogger,
  walletAddressDisplay,
} from "@coral-xyz/common";
import {
  useEthereumCtx,
  useTransactionData,
  useAvatarUrl,
  useActiveWallet,
} from "@coral-xyz/recoil";
import { useNavigation } from "@react-navigation/native";
import { ethers } from "ethers";

import {
  Error,
  Sending,
  Header,
  Container,
} from "~components/BottomDrawerCards";
import {
  TransactionData,
  EthereumSettingsDrawer,
} from "~components/TransactionData";
import { PrimaryButton, TokenAmountHeader, Margin } from "~components/index";
import { useTheme } from "~hooks/useTheme";

const logger = getLogger("send-ethereum-confirmation-card");
const { base58: bs58 } = ethers.utils;

const error =
  "Error 422. Transaction time out. Runtime error. Reticulating splines.";

export function SendEthereumConfirmationCard({
  token,
  destinationAddress,
  amount,
  onComplete,
}: {
  token: {
    address: string;
    logo: string;
    decimals: number;
    // For ERC721 sends
    tokenId?: string;
  };
  destinationAddress: string;
  amount: BigNumber;
  onComplete?: () => void;
}) {
  const ethereumCtx = useEthereumCtx();
  const [txSignature, setTxSignature] = useState<string | null>(null);
  const [transaction, setTransaction] = useState<UnsignedTransaction | null>(
    null
  );
  const [cardType, setCardType] = useState<
    "confirm" | "sending" | "complete" | "error" | "advanced"
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
      if (onComplete) {
        onComplete();
      }
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
    <>
      {cardType === "confirm" ? (
        <ConfirmSendEthereum
          token={token}
          destinationAddress={destinationAddress}
          transaction={transaction}
          amount={amount}
          onConfirm={onConfirm}
          onToggleAdvanced={() => setCardType("advanced")}
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
        />
      ) : cardType === "advanced" ? (
        <EthereumAdvancedSettings
          token={token}
          blockchain={Blockchain.ETHEREUM}
          destinationAddress={destinationAddress}
          transaction={transaction}
          amount={amount}
          onClose={() => setCardType("confirm")}
        />
      ) : (
        <Error
          blockchain={Blockchain.ETHEREUM}
          signature={txSignature!}
          onRetry={() => retry()}
          error={error}
        />
      )}
    </>
  );
}

type TransactionMode = "normal" | "fast" | "degen" | "custom";
export function EthereumAdvancedSettings({
  blockchain,
  token,
  destinationAddress,
  transaction,
  amount,
  onClose,
}: any): JSX.Element {
  const [mode, setMode] = useState<TransactionMode>("normal");
  const transactionData = useTransactionData(
    Blockchain.ETHEREUM,
    bs58.encode(ethers.utils.serializeTransaction(transaction))
  );

  const {
    loading,
    network,
    networkFee,
    networkFeeUsd,
    transactionOverrides,
    setTransactionOverrides,
    simulationError,
  } = transactionData;

  return (
    <EthereumSettingsDrawer
      mode={mode}
      setMode={setMode}
      transactionOverrides={transactionOverrides}
      setTransactionOverrides={setTransactionOverrides}
      networkFeeUsd={networkFeeUsd}
      onClose={onClose}
    />
  );
}

export function ConfirmSendEthereum({
  token,
  destinationAddress,
  amount,
  transaction,
  onConfirm,
  destinationUser,
  onToggleAdvanced,
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
  onToggleAdvanced: () => object;
}) {
  const theme = useTheme();
  const avatarUrl = useAvatarUrl();
  const wallet = useActiveWallet();

  const transactionData = useTransactionData(
    Blockchain.ETHEREUM,
    bs58.encode(ethers.utils.serializeTransaction(transaction))
  );

  const { from, loading, transaction: transactionToSend } = transactionData;

  const menuItems = {
    From: {
      disabled: true,
      detail: <Text>{walletAddressDisplay(from)}</Text>,
    },
    To: {
      disabled: true,
      detail: <Text>{walletAddressDisplay(destinationAddress)}</Text>,
    },
  };

  return (
    <Container>
      <Header text="Review Send" />
      <Margin vertical={24}>
        <TokenAmountHeader amount={amount} token={token} />
      </Margin>
      <Margin bottom={24}>
        <TransactionData
          transactionData={transactionData}
          menuItems={menuItems}
          onToggleAdvanced={onToggleAdvanced}
        />
      </Margin>
      <PrimaryButton
        label="Send"
        disabled={loading}
        onPress={() =>
          onConfirm(
            ethers.utils.parseTransaction(bs58.decode(transactionToSend))
          )
        }
      />
    </Container>
  );
}
