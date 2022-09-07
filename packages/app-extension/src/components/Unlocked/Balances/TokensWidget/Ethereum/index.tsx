import { useState, useEffect } from "react";
import { ethers, BigNumber } from "ethers";
import type { UnsignedTransaction } from "@ethersproject/transactions";
import { Typography } from "@mui/material";
import { getLogger, Blockchain, Ethereum } from "@coral-xyz/common";
import { useEthereumCtx, useTransactionData } from "@coral-xyz/recoil";
import { useCustomTheme } from "@coral-xyz/themes";
import { TokenAmountDisplay, Sending, Error } from "../Send";
import { walletAddressDisplay, PrimaryButton } from "../../../../common";
import { SettingsList } from "../../../../common/Settings/List";

const logger = getLogger("send-ethereum-confirmation-card");
const { base58: bs58 } = ethers.utils;

export function SendEthereumConfirmationCard({
  token,
  to,
  amount,
}: {
  token: {
    address: string;
    logo: string;
    decimals: number;
    // For ERC721 sends
    tokenId?: string;
  };
  to: string;
  amount: BigNumber;
  close: (transactionToSend: UnsignedTransaction) => void;
}) {
  const ethereumCtx = useEthereumCtx();
  const [txSignature, setTxSignature] = useState<string | null>(null);
  const [error, setError] = useState(
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
        transaction = await Ethereum.transferEthTransaction({
          to: to,
          value: amount.toString(),
        });
      } else if (token.tokenId) {
        // Token has a tokenId, must be an ERC721 token
        transaction = await Ethereum.transferErc721Transaction(ethereumCtx, {
          from: ethereumCtx.walletPublicKey,
          to: to,
          contractAddress: token.address!,
          tokenId: token.tokenId,
        });
      } else {
        // Otherwise assume it is an ERC20 token
        transaction = await Ethereum.transferErc20Transaction(ethereumCtx, {
          to: to,
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
    } catch (err) {
      logger.error("ethereum transaction failed", err);
      setCardType("error");
    }
  };

  if (!transaction) {
    // TODO loader
    return <></>;
  }

  const retry = () => onConfirm(transaction);

  return (
    <div>
      {cardType === "confirm" ? (
        <ConfirmSendEthereum
          token={token}
          to={to}
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
          isComplete={true}
          amount={amount}
          token={token}
          signature={txSignature!}
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

export function ConfirmSendEthereum({
  token,
  to,
  amount,
  transaction,
  onConfirm,
}: {
  token: {
    address?: string;
    logo?: string;
    ticker?: string;
    decimals: number;
  };
  to: string;
  amount: BigNumber;
  transaction: UnsignedTransaction;
  onConfirm: (transactionToSend: UnsignedTransaction) => void;
}) {
  const theme = useCustomTheme();
  const ethereumCtx = useEthereumCtx();
  const { from, simulationError, network, networkFee } = useTransactionData(
    Blockchain.ETHEREUM,
    bs58.encode(ethers.utils.serializeTransaction(transaction))
  );

  const transactionOverrides = {
    type: 2,
    maxFeePerGas: ethereumCtx.feeData.maxFeePerGas,
    maxPriorityFeePerGas: ethereumCtx.feeData.maxPriorityFeePerGas,
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
        <TokenAmountDisplay
          style={{
            marginTop: "40px",
            marginBottom: "40px",
          }}
          amount={amount}
          token={token}
        />
        <ConfirmEthereumSendTable
          to={destinationAddress}
          from={from}
          network={network}
          networkFee={networkFee}
        />
        {simulationError && (
          <Typography
            style={{
              color: theme.custom.colors.negative,
              marginTop: "8px",
              textAlign: "center",
            }}
          >
            This transaction is unlikely to succeed.
          </Typography>
        )}
      </div>
      <PrimaryButton
        style={{ marginTop: "16px" }}
        onClick={() =>
          onConfirm({
            ...transaction,
            ...transactionOverrides,
          } as UnsignedTransaction)
        }
        label="Send"
        type="submit"
        data-testid="Send"
      />
    </div>
  );
}

const ConfirmEthereumSendTable: React.FC<{
  to: string;
  from: string;
  network: string;
  networkFee: string;
}> = ({ to, from, network, networkFee }) => {
  const theme = useCustomTheme();

  const menuItems = {
    From: {
      onClick: () => {},
      detail: <Typography>{walletAddressDisplay(from)}</Typography>,
      button: false,
    },
    To: {
      onClick: () => {},
      detail: <Typography>{walletAddressDisplay(to)}</Typography>,
      button: false,
    },
    Network: {
      onClick: () => {},
      detail: <Typography>{network}</Typography>,
      button: false,
    },
    "Network fee": {
      onClick: () => {},
      detail: <Typography>{networkFee}</Typography>,
      button: false,
    },
  };

  return (
    <SettingsList
      menuItems={menuItems}
      style={{ margin: 0 }}
      textStyle={{
        color: theme.custom.colors.secondary,
      }}
    />
  );
};
