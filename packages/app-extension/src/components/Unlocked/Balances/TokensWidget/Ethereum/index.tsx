import { useState, useEffect } from "react";
import { ethers, BigNumber } from "ethers";
import type { TransactionRequest } from "@ethersproject/abstract-provider";
import type { UnsignedTransaction } from "@ethersproject/transactions";
import { Typography } from "@mui/material";
import { getLogger, Blockchain, Ethereum } from "@coral-xyz/common";
import { useEthereumCtx } from "@coral-xyz/recoil";
import { useCustomTheme } from "@coral-xyz/themes";
import { TokenAmountDisplay, Sending, Error } from "../Send";
import { walletAddressDisplay, PrimaryButton } from "../../../../common";
import { SettingsList } from "../../../../common/Settings/List";

const logger = getLogger("send-ethereum-confirmation-card");

export function SendEthereumConfirmationCard({
  token,
  destinationAddress,
  amount,
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
        transaction = await Ethereum.transferEthTransaction(ethereumCtx, {
          to: destinationAddress,
          value: amount.toString(),
        });
      } else if (token.tokenId) {
        // Token has a tokenId, must be an ERC721 token
        transaction = await Ethereum.transferErc721Transaction(ethereumCtx, {
          from: ethereumCtx.walletPublicKey,
          to: destinationAddress,
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
          destinationAddress={destinationAddress}
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
  destinationAddress,
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
  destinationAddress: string;
  amount: BigNumber;
  transaction: UnsignedTransaction;
  onConfirm: (transactionToSend: UnsignedTransaction) => void;
}) {
  const theme = useCustomTheme();
  const ethereumCtx = useEthereumCtx();

  console.log("Confirm send", transaction);

  const [estimatedFee, setEstimatedFee] = useState(BigNumber.from(0));
  const [estimatedFeeError, setEstimatedFeeError] = useState(false);
  const [gasLimit, setGasLimit] = useState(BigNumber.from(0));
  const [nonce, setNonce] = useState(0);

  useEffect(() => {
    (async () => {
      const nonce = await ethereumCtx.provider.getTransactionCount(
        ethereumCtx.walletPublicKey
      );
      setNonce(nonce);
    })();
  });

  useEffect(() => {
    (async () => {
      let estimatedGas;
      try {
        estimatedGas = await ethereumCtx.provider.estimateGas(
          transaction as TransactionRequest
        );
      } catch (error) {
        // Fee estimate failed, transaction is unlikely to succeed
        console.error("could not estimate gas", error);
        estimatedGas = BigNumber.from("150000");
        setEstimatedFeeError(true);
      }
      setGasLimit(estimatedGas);
      setEstimatedFee(
        estimatedGas
          .mul(ethereumCtx.feeData.maxFeePerGas!)
          .add(estimatedGas.mul(ethereumCtx.feeData.maxPriorityFeePerGas!))
      );
    })();
  }, [transaction]);

  const transactionOverrides = {
    type: 2,
    nonce: nonce,
    gasLimit,
    maxFeePerGas: ethereumCtx.feeData.maxFeePerGas,
    maxPriorityFeePerGas: ethereumCtx.feeData.maxPriorityFeePerGas,
  };

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
        <TokenAmountDisplay
          style={{
            marginTop: "40px",
            marginBottom: "40px",
          }}
          amount={amount}
          token={token}
        />
        <ConfirmEthereumSendTable
          destinationAddress={destinationAddress}
          nonce={nonce}
          estimatedFee={estimatedFee}
          gasPrice={ethereumCtx.feeData.gasPrice!}
          maxFeePerGas={ethereumCtx.feeData.maxFeePerGas!}
          maxPriorityFeePerGas={ethereumCtx.feeData.maxPriorityFeePerGas!}
        />
        {estimatedFeeError && (
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
  destinationAddress: string;
  estimatedFee: BigNumber;
  nonce: number;
  gasPrice: BigNumber;
  maxFeePerGas: BigNumber;
  maxPriorityFeePerGas: BigNumber;
}> = ({
  destinationAddress,
  estimatedFee,
  nonce,
  gasPrice,
  maxFeePerGas,
  maxPriorityFeePerGas,
}) => {
  const theme = useCustomTheme();
  const ethereumCtx = useEthereumCtx();

  const menuItems = {
    From: {
      onClick: () => {},
      detail: (
        <Typography>
          {walletAddressDisplay(ethereumCtx.walletPublicKey)}
        </Typography>
      ),
      button: false,
    },
    To: {
      onClick: () => {},
      detail: (
        <Typography>{walletAddressDisplay(destinationAddress)}</Typography>
      ),
      button: false,
    },
    "Network fee": {
      onClick: () => {},
      detail: (
        <Typography>
          {ethers.utils.formatUnits(estimatedFee).substring(0, 10)}{" "}
          <span style={{ color: theme.custom.colors.secondary }}>ETH</span>
        </Typography>
      ),
      button: false,
    },
    /**
*   TODO make configurable via advanced option along with gas limit and gas pricing
    Nonce: {
      onClick: () => {},
      detail: <Typography>{nonce}</Typography>,
      classes: { root: classes.confirmTableListItem },
      button: false,
    },
  **/
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
