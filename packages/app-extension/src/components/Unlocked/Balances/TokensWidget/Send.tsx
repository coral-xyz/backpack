import { useState, useEffect } from "react";
import { ethers, BigNumber } from "ethers";
import { CircularProgress, Typography, Link } from "@mui/material";
import { styles, useCustomTheme } from "@coral-xyz/themes";
import { Connection, SystemProgram, PublicKey } from "@solana/web3.js";
import {
  useAnchorContext,
  useBlockchainTokenAccount,
  useEthereumCtx,
  useEthereumExplorer,
  useEthereumConnectionUrl,
  useSolanaConnectionUrl,
  useSolanaCtx,
  useSolanaExplorer,
  useNavigation,
} from "@coral-xyz/recoil";
import {
  Blockchain,
  Ethereum,
  Solana,
  confirmTransaction,
  getLogger,
  explorerUrl,
  toTitleCase,
  SOL_NATIVE_MINT,
  ETH_NATIVE_MINT,
  NATIVE_ACCOUNT_RENT_EXEMPTION_LAMPORTS,
} from "@coral-xyz/common";
import { WithHeaderButton } from "./Token";
import {
  TextField,
  TextFieldLabel,
  walletAddressDisplay,
  PrimaryButton,
  SecondaryButton,
  DangerButton,
} from "../../../common";
import { TokenInputField } from "../../../common/TokenInput";
import { useDrawerContext } from "../../../common/Layout/Drawer";
import { useNavStack } from "../../../common/Layout/NavStack";
import { MaxLabel } from "../../../common/MaxLabel";
import { ApproveTransactionDrawer } from "../../../common/ApproveTransactionDrawer";
import { SettingsList } from "../../../common/Settings/List";
import { CheckIcon } from "../../../common/Icon";

const logger = getLogger("send-component");

const useStyles = styles((theme) => ({
  container: {
    display: "flex",
    flexDirection: "column",
    height: "100%",
  },
  topHalf: {
    paddingTop: "24px",
    flex: 1,
  },
  buttonContainer: {
    display: "flex",
    paddingLeft: "12px",
    paddingRight: "12px",
    paddingBottom: "24px",
    paddingTop: "25px",
    justifyContent: "space-between",
  },
  textRoot: {
    marginTop: "0 !important",
    marginBottom: "0 !important",
    "& .MuiOutlinedInput-root": {
      backgroundColor: `${theme.custom.colors.nav} !important`,
    },
  },
  bottomHalfLabel: {
    fontWeight: 500,
    color: theme.custom.colors.secondary,
    fontSize: "12px",
    lineHeight: "16px",
  },
  confirmRow: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "8px",
  },
  confirmRowLabelLeft: {
    fontSize: "12px",
    lineHeight: "16px",
    fontWeight: 500,
    color: theme.custom.colors.secondary,
  },
  confirmRowLabelRight: {
    fontSize: "12px",
    lineHeight: "16px",
    fontWeight: 500,
    color: theme.custom.colors.fontColor,
  },
  confirmTableListItem: {
    "&:hover": {
      opacity: 1,
    },
  },
}));

export function SendButton({
  blockchain,
  address,
}: {
  blockchain: Blockchain;
  address: string;
}) {
  const token = useBlockchainTokenAccount(blockchain, address);
  return (
    <WithHeaderButton
      label={"Send"}
      routes={[
        {
          name: "send",
          component: (props: any) => <Send {...props} />,
          title: `${token.ticker} / Send`,
          props: {
            blockchain,
            tokenAddress: address,
          },
        },
      ]}
    />
  );
}

export function Send({
  blockchain,
  tokenAddress,
}: {
  blockchain: Blockchain;
  tokenAddress: string;
}) {
  const classes = useStyles() as any;
  const { close } = useDrawerContext();
  const nav = useNavStack();
  const token = useBlockchainTokenAccount(blockchain, tokenAddress);
  const { provider: solanaProvider } = useAnchorContext();

  const [openDrawer, setOpenDrawer] = useState(false);
  const [address, setAddress] = useState("");
  const [amount, setAmount] = useState<BigNumber | undefined>(undefined);
  const [feeOffset, setFeeOffset] = useState(BigNumber.from(0));

  const {
    isValidAddress,
    isFreshAddress: _,
    isErrorAddress,
  } = useIsValidAddress(blockchain, address, solanaProvider.connection);

  useEffect(() => {
    if (token.mint === SOL_NATIVE_MINT) {
      // When sending SOL, account for the tx fee and rent exempt minimum.
      setFeeOffset(
        BigNumber.from(5000).add(
          BigNumber.from(NATIVE_ACCOUNT_RENT_EXEMPTION_LAMPORTS)
        )
      );
    } else if (token.address === ETH_NATIVE_MINT) {
      // 21,000 GWEI for a standard ETH transfer
      setFeeOffset(BigNumber.from("21000000000000"));
    }
  }, [blockchain, tokenAddress]);

  const amountWithFee = BigNumber.from(token.nativeBalance).sub(feeOffset);
  const maxAmount = amountWithFee.gt(0) ? amountWithFee : BigNumber.from(0);
  const exceedsBalance = amount && amount.gt(maxAmount);
  const isSendDisabled = !isValidAddress || amount === null || !!exceedsBalance;
  const isAmountError = amount && exceedsBalance;

  useEffect(() => {
    nav.setTitle(`Send ${token.ticker}`);
  }, [nav]);

  // On click handler.
  const onNext = () => {
    if (!amount) {
      return;
    }
    setOpenDrawer(true);
  };

  let sendButton;
  if (isErrorAddress) {
    sendButton = <DangerButton disabled={true} label="Invalid Address" />;
  } else if (isAmountError) {
    sendButton = <DangerButton disabled={true} label="Insufficient Balance" />;
  } else {
    sendButton = (
      <PrimaryButton
        disabled={isSendDisabled}
        label="Send"
        type="submit"
        data-testid="Send"
      />
    );
  }

  return (
    <form
      className={classes.container}
      onSubmit={(e) => {
        e.preventDefault();
        onNext();
      }}
      noValidate
    >
      <div className={classes.topHalf}>
        <div style={{ marginBottom: "40px" }}>
          <TextFieldLabel
            leftLabel={"Send to"}
            rightLabel={""}
            style={{ marginLeft: "24px", marginRight: "24px" }}
          />
          <div style={{ margin: "0 12px" }}>
            <TextField
              rootClass={classes.textRoot}
              placeholder={`${toTitleCase(blockchain)} address`}
              value={address}
              setValue={setAddress}
              isError={isErrorAddress}
              inputProps={{
                name: "to",
              }}
            />
          </div>
        </div>
        <div>
          <TextFieldLabel
            leftLabel={"Amount"}
            rightLabel={`${token.displayBalance} ${token.ticker}`}
            rightLabelComponent={
              <MaxLabel
                amount={maxAmount}
                onSetAmount={setAmount}
                decimals={token.decimals}
              />
            }
            style={{ marginLeft: "24px", marginRight: "24px" }}
          />
          <div style={{ margin: "0 12px" }}>
            <TokenInputField
              type="number"
              placeholder="0"
              rootClass={classes.textRoot}
              decimals={token.decimals}
              value={amount}
              setValue={setAmount}
              isError={isAmountError}
              inputProps={{
                name: "amount",
              }}
            />
          </div>
        </div>
      </div>
      <div className={classes.buttonContainer}>
        {sendButton}
        <ApproveTransactionDrawer
          openDrawer={openDrawer}
          setOpenDrawer={setOpenDrawer}
        >
          <SendConfirmationCard
            blockchain={blockchain}
            token={token}
            address={address}
            amount={amount!}
            close={() => {
              setOpenDrawer(false);
              close();
            }}
          />
        </ApproveTransactionDrawer>
      </div>
    </form>
  );
}

export function SendConfirmationCard({
  blockchain,
  token,
  address,
  amount,
}: {
  blockchain: Blockchain;
  token: {
    address?: string;
    logo?: string;
    ticker?: string;
    mint: string;
    decimals: number;
  };
  address: string;
  amount: BigNumber;
  close: () => void;
}) {
  const solanaCtx = useSolanaCtx();
  const ethereumCtx = useEthereumCtx();
  const [txSignature, setTxSignature] = useState<string | null>(null);
  const [cardType, setCardType] = useState<
    "confirm" | "sending" | "complete" | "error"
  >("confirm");

  const onConfirm = async (txSettings: object) => {
    setCardType("sending");
    switch (blockchain) {
      case Blockchain.SOLANA:
        return await onSolanaTransfer();
      case Blockchain.ETHEREUM:
        return await onEthereumTransfer(txSettings);
    }
  };

  const onEthereumTransfer = async (txSettings = {}) => {
    //
    // Send the tx.
    //
    //
    let txSig;
    try {
      if (token.address === ethers.constants.AddressZero) {
        // Zero address token is native ETH
        txSig = await Ethereum.transferEth(ethereumCtx, {
          to: address,
          value: amount.toString(),
          ...txSettings,
        });
      } else {
        txSig = await Ethereum.transferToken(ethereumCtx, {
          to: address,
          tokenAddress: token.address!,
          amount: amount.toString(),
          ...txSettings,
        });
      }
    } catch (err) {
      logger.error("unable to send ethereum transaction", err);
      setCardType("error");
      return;
    }

    setTxSignature(txSig);

    //
    // Confirm the tx.
    //
    try {
      // Wait for mining
      await ethereumCtx.provider.waitForTransaction(txSig);
      // Grab the transaction
      const transaction = await ethereumCtx.provider.getTransaction(txSig);
      // We already waited, but calling .wait will throw if the transaction failed
      await transaction.wait();
      setCardType("complete");
    } catch (err) {
      logger.error("ethereum transaction failed", err);
      setCardType("error");
    }
  };

  const onSolanaTransfer = async () => {
    //
    // Send the tx.
    //
    let txSig;
    try {
      if (token.mint === SOL_NATIVE_MINT.toString()) {
        txSig = await Solana.transferSol(solanaCtx, {
          source: solanaCtx.walletPublicKey,
          destination: new PublicKey(address),
          amount: amount.toNumber(),
        });
      } else {
        txSig = await Solana.transferToken(solanaCtx, {
          destination: new PublicKey(address),
          mint: new PublicKey(token.mint),
          amount: amount.toNumber(),
          decimals: token.decimals,
        });
      }
    } catch (err) {
      logger.error("solana transaction failed", err);
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
    } catch (err) {
      logger.error("unable to confirm", err);
      setCardType("error");
    }
  };

  const retry = () => {
    // todo
  };

  return (
    <div>
      {cardType === "confirm" ? (
        <ConfirmSend
          blockchain={blockchain}
          token={token}
          address={address}
          amount={amount}
          onConfirm={onConfirm}
        />
      ) : cardType === "sending" ? (
        <Sending
          blockchain={blockchain}
          isComplete={false}
          amount={amount}
          token={token}
          signature={txSignature!}
        />
      ) : cardType === "complete" ? (
        <Sending
          blockchain={blockchain}
          isComplete={true}
          amount={amount}
          token={token}
          signature={txSignature!}
        />
      ) : (
        <Error
          blockchain={blockchain}
          signature={txSignature!}
          onRetry={() => retry()}
        />
      )}
    </div>
  );
}

function ConfirmSend({
  blockchain,
  token,
  address,
  amount,
  onConfirm,
}: {
  blockchain: Blockchain;
  token: {
    address?: string;
    logo?: string;
    ticker?: string;
    mint: string;
    decimals: number;
  };
  address: string;
  amount: BigNumber;
  onConfirm: (txSettings: any) => void;
}) {
  const theme = useCustomTheme();
  const ethereumCtx = useEthereumCtx();
  const [estimatedFee, setEstimatedFee] = useState(BigNumber.from(0));
  const [estimatedFeeError, setEstimatedFeeError] = useState(false);
  // Ethereum specific
  const [gasLimit, setGasLimit] = useState(BigNumber.from(0));
  const [nonce, setNonce] = useState(0);
  const [feeData, setFeeData] = useState<any | null>(null);

  useEffect(() => {
    if (blockchain === Blockchain.ETHEREUM) {
      (async () => {
        let estimatedGasPromise = new Promise(
          async (resolve: (value: BigNumber) => void, reject) => {
            if (token.address === ETH_NATIVE_MINT) {
              resolve(BigNumber.from("21000"));
            } else {
              // Estimate gas for an ERC20 transfer, the transfer cost can vary depending on the
              // ERC20 transfer method in the contract.
              const abi = [
                "function transfer(address to, uint amount) returns (bool)",
              ];
              const erc20 = new ethers.Contract(
                token.address!,
                abi,
                ethereumCtx.provider
              );
              const tx = await erc20.populateTransaction.transfer(
                address,
                amount
              );
              try {
                const gasEstimate = await ethereumCtx.provider.estimateGas(tx);
                resolve(gasEstimate);
              } catch (error) {
                console.log("could not estimate transaction fee", error);
                reject(error);
              }
            }
          }
        );

        const [nonceResult, feeDataResult, estimatedGasResult] =
          await Promise.allSettled([
            ethereumCtx.provider.getTransactionCount(
              ethereumCtx.walletPublicKey
            ),
            ethereumCtx.provider.getFeeData(),
            estimatedGasPromise,
          ]);

        if (nonceResult.status === "fulfilled") {
          setNonce(nonceResult.value);
        }
        if (feeDataResult.status === "fulfilled") {
          setFeeData(feeDataResult.value);
        }
        if (estimatedGasResult.status === "fulfilled") {
          setGasLimit(estimatedGasResult.value);
          if (feeDataResult.status === "fulfilled") {
            setEstimatedFee(
              estimatedGasResult.value
                .mul(feeDataResult.value.maxFeePerGas!)
                .add(
                  estimatedGasResult.value.mul(
                    feeDataResult.value.maxPriorityFeePerGas!
                  )
                )
            );
          } else {
            // Fee estimate failed, transaction is unlikely to succeed
            setEstimatedFeeError(true);
          }
        }
      })();
    } else {
      setEstimatedFee(BigNumber.from(5000));
    }
  }, []);

  const txSettings =
    blockchain === Blockchain.ETHEREUM
      ? {
          type: 2,
          nonce: nonce,
          gasLimit,
          maxFeePerGas: feeData ? feeData.maxFeePerGas : BigNumber.from(0),
          maxPriorityFeePerGas: feeData
            ? feeData.maxPriorityFeePerGas
            : BigNumber.from(0),
        }
      : // No additional settings for Solana
        {};

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
        <ConfirmSendToken
          style={{
            marginTop: "40px",
            marginBottom: "40px",
          }}
          amount={amount}
          token={token}
        />
        {blockchain === Blockchain.ETHEREUM && (
          <ConfirmEthereumSendTable
            destinationAddress={address}
            estimatedFee={estimatedFee}
            gasPrice={feeData ? feeData.gasPrice : BigNumber.from(0)}
            maxFeePerGas={feeData ? feeData.maxFeePerGas : BigNumber.from(0)}
            maxPriorityFeePerGas={
              feeData ? feeData.maxPriorityFeePerGas : BigNumber.from(0)
            }
            nonce={nonce}
          />
        )}
        {blockchain === Blockchain.SOLANA && (
          <ConfirmSolanaSendTable destinationAddress={address} />
        )}
      </div>
      <PrimaryButton
        onClick={() => onConfirm(txSettings)}
        label="Send"
        type="submit"
        data-testid="Send"
      />
    </div>
  );
}

const ConfirmSendToken: React.FC<{
  style: React.CSSProperties;
  token: { logo?: string; ticker?: string; mint: string; decimals: number };
  amount: BigNumber;
}> = ({ style, token, amount }) => {
  const theme = useCustomTheme();

  return (
    <div
      style={{
        display: "flex",
        ...style,
      }}
    >
      {/* Dummy padding to center flex content */}
      <div style={{ flex: 1 }} />
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          flexDirection: "column",
          marginRight: "8px",
        }}
      >
        <img
          src={token.logo}
          style={{
            width: "32px",
            height: "32px",
            borderRadius: "16px",
          }}
        />
      </div>
      <Typography
        style={{
          color: theme.custom.colors.fontColor,
          fontWeight: 500,
          fontSize: "30px",
          lineHeight: "36px",
          textAlign: "center",
        }}
      >
        {ethers.utils.formatUnits(amount, token.decimals)}
        <span
          style={{
            marginLeft: "8px",
            color: theme.custom.colors.secondary,
          }}
        >
          {token.ticker}
        </span>
      </Typography>
      {/* Dummy padding to center flex content */}
      <div style={{ flex: 1 }} />
    </div>
  );
};

const ConfirmSolanaSendTable: React.FC<{
  destinationAddress: string;
}> = ({ destinationAddress }) => {
  const theme = useCustomTheme();
  const classes = useStyles();
  const solanaCtx = useSolanaCtx();

  const menuItems = {
    From: {
      onClick: () => {},
      detail: (
        <Typography>
          {walletAddressDisplay(solanaCtx.walletPublicKey)}
        </Typography>
      ),
      classes: { root: classes.confirmTableListItem },
      button: false,
    },
    To: {
      onClick: () => {},
      detail: (
        <Typography>{walletAddressDisplay(destinationAddress)}</Typography>
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
  const classes = useStyles();
  const ethereumCtx = useEthereumCtx();

  const menuItems = {
    From: {
      onClick: () => {},
      detail: (
        <Typography>
          {walletAddressDisplay(ethereumCtx.walletPublicKey)}
        </Typography>
      ),
      classes: { root: classes.confirmTableListItem },
      button: false,
    },
    To: {
      onClick: () => {},
      detail: (
        <Typography>{walletAddressDisplay(destinationAddress)}</Typography>
      ),
      classes: { root: classes.confirmTableListItem },
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
      classes: { root: classes.confirmTableListItem },
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

function Sending({
  blockchain,
  amount,
  token,
  signature,
  isComplete,
}: {
  blockchain: Blockchain;
  amount: BigNumber;
  token: any;
  signature: string;
  isComplete: boolean;
}) {
  const theme = useCustomTheme();
  const nav = useNavigation();
  const drawer = useDrawerContext();
  const solanaExplorer = useSolanaExplorer();
  const solanaConnectionUrl = useSolanaConnectionUrl();
  const ethereumExplorer = useEthereumExplorer();
  const ethereumConnectionUrl = useEthereumConnectionUrl();

  const explorer =
    blockchain === Blockchain.SOLANA ? solanaExplorer : ethereumExplorer;
  const connectionUrl =
    blockchain === Blockchain.SOLANA
      ? solanaConnectionUrl
      : ethereumConnectionUrl;

  return (
    <div
      style={{
        height: "264px",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Typography
        style={{
          textAlign: "center",
          color: theme.custom.colors.secondary,
          fontSize: "14px",
          fontWeight: 500,
          marginTop: "30px",
        }}
      >
        {isComplete ? "Sent" : "Sending..."}
      </Typography>
      <ConfirmSendToken
        style={{
          marginTop: "16px",
          marginBottom: "0px",
        }}
        amount={amount}
        token={token}
      />
      <div
        style={{
          flex: 1,
          display: "flex",
          justifyContent: "center",
          flexDirection: "column",
        }}
      >
        {isComplete ? (
          <div style={{ textAlign: "center" }}>
            <CheckIcon />
          </div>
        ) : (
          <CircularProgress
            size={48}
            style={{
              color: theme.custom.colors.primaryButton,
              display: "flex",
              marginLeft: "auto",
              marginRight: "auto",
            }}
            thickness={6}
          />
        )}
      </div>
      <div
        style={{
          marginBottom: "16px",
          marginLeft: "16px",
          marginRight: "16px",
        }}
      >
        <SecondaryButton
          onClick={() => {
            if (isComplete) {
              nav.toRoot();
              drawer.close();
            } else {
              window.open(explorerUrl(explorer, signature, connectionUrl));
            }
          }}
          label={isComplete ? "View Balances" : "View Explorer"}
        />
      </div>
    </div>
  );
}

function Error({
  blockchain,
  signature,
  onRetry,
}: {
  blockchain: Blockchain;
  signature: string;
  onRetry: () => void;
}) {
  const theme = useCustomTheme();
  const solanaExplorer = useSolanaExplorer();
  const solanaConnectionUrl = useSolanaConnectionUrl();
  const ethereumExplorer = useEthereumExplorer();
  const ethereumConnectionUrl = useEthereumConnectionUrl();

  const explorer =
    blockchain === Blockchain.SOLANA ? solanaExplorer : ethereumExplorer;
  const connectionUrl =
    blockchain === Blockchain.SOLANA
      ? solanaConnectionUrl
      : ethereumConnectionUrl;

  return (
    <div
      style={{
        height: "340px",
        display: "flex",
        justifyContent: "space-between",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        <Typography
          style={{ textAlign: "center", color: theme.custom.colors.secondary }}
        >
          There was a problem confirming the transaction.
        </Typography>
        <Link
          href={explorerUrl(explorer, signature, connectionUrl)}
          target="_blank"
          style={{ textAlign: "center" }}
        >
          View Transaction
        </Link>
      </div>
      <div>TODO</div>
    </div>
  );
}

export function BottomCard({
  onButtonClick,
  onCancelButtonClick,
  buttonLabel,
  buttonStyle,
  buttonLabelStyle,
  cancelButtonLabel,
  cancelButtonStyle,
  cancelButtonLabelStyle,
  children,
  topHalfStyle,
  wrapperStyle,
}: any) {
  const theme = useCustomTheme();
  return (
    <div
      style={{
        background: "transparent",
        display: "flex",
        flexDirection: "column",
        height: "100%",
        ...wrapperStyle,
      }}
    >
      <div
        style={{
          height: "100%",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          background: theme.custom.colors.background,
          borderTopLeftRadius: "12px",
          borderTopRightRadius: "12px",
        }}
      >
        <div
          style={{
            flex: 1,
            background: theme.custom.colors.drawerGradient,
            ...topHalfStyle,
          }}
        >
          {children}
        </div>
        <div
          style={{
            marginBottom: "24px",
            marginLeft: "12px",
            marginRight: "12px",
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          {cancelButtonLabel && (
            <SecondaryButton
              style={{
                marginRight: "8px",
                ...cancelButtonStyle,
              }}
              buttonLabelStyle={cancelButtonLabelStyle}
              onClick={onCancelButtonClick}
              label={cancelButtonLabel}
            />
          )}
          {buttonLabel && (
            <PrimaryButton
              style={buttonStyle}
              buttonLabelStyle={buttonLabelStyle}
              onClick={onButtonClick}
              label={buttonLabel}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export function useIsValidAddress(
  blockchain: Blockchain,
  address: string,
  solanaConnection?: Connection
) {
  const [addressError, setAddressError] = useState<boolean>(false);
  const [isFreshAccount, setIsFreshAccount] = useState<boolean>(false); // Not used for now.
  const [accountValidated, setAccountValidated] = useState<boolean>(false);

  // This effect validates the account address given.
  useEffect(() => {
    if (accountValidated) {
      setAccountValidated(false);
    }
    if (address === "") {
      setAccountValidated(false);
      setAddressError(false);
      return;
    }
    (async () => {
      if (blockchain === Blockchain.SOLANA) {
        // Solana address validation
        let pubkey;
        try {
          pubkey = new PublicKey(address);
        } catch (err) {
          setAddressError(true);
          // Not valid address so don't bother validating it.
          return;
        }

        if (!solanaConnection) {
          return;
        }

        const account = await solanaConnection.getAccountInfo(pubkey);

        // Null data means the account has no lamports. This is valid.
        if (!account) {
          setIsFreshAccount(true);
          setAccountValidated(true);
          return;
        }

        // Only allow system program accounts to be given. ATAs only!
        if (!account.owner.equals(SystemProgram.programId)) {
          setAddressError(true);
          return;
        }

        // The account data has been successfully validated.
        setAddressError(false);
        setAccountValidated(true);
      } else if (blockchain === Blockchain.ETHEREUM) {
        // Ethereum address validation
        try {
          ethers.utils.getAddress(address);
        } catch (e) {
          setAddressError(true);
          return;
        }
        setAccountValidated(true);
      }
    })();
  }, [address]);

  return {
    isValidAddress: accountValidated,
    isFreshAddress: isFreshAccount,
    isErrorAddress: addressError,
  };
}
