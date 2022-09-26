import { useState, useEffect } from "react";
import { ethers, BigNumber } from "ethers";
import { Typography } from "@mui/material";
import { styles, useCustomTheme } from "@coral-xyz/themes";
import { Connection, SystemProgram, PublicKey } from "@solana/web3.js";
import {
  blockchainTokenData,
  useAnchorContext,
  useBlockchainTokenAccount,
  useBlockchainExplorer,
  useBlockchainConnectionUrl,
  useEthereumCtx,
  useLoader,
  useNavigation,
  TokenData,
} from "@coral-xyz/recoil";
import {
  Blockchain,
  explorerUrl,
  toTitleCase,
  SOL_NATIVE_MINT,
  ETH_NATIVE_MINT,
  NATIVE_ACCOUNT_RENT_EXEMPTION_LAMPORTS,
  BACKPACK_FEATURE_MULTICHAIN,
} from "@coral-xyz/common";
import { WithHeaderButton } from "./Token";
import { SendEthereumConfirmationCard } from "./Ethereum";
import { SendSolanaConfirmationCard } from "./Solana";
import {
  TextField,
  TextFieldLabel,
  PrimaryButton,
  SecondaryButton,
  DangerButton,
  Loading,
} from "../../../common";
import { TokenInputField } from "../../../common/TokenInput";
import { useDrawerContext } from "../../../common/Layout/Drawer";
import { useNavStack } from "../../../common/Layout/NavStack";
import { MaxLabel } from "../../../common/MaxLabel";
import { ApproveTransactionDrawer } from "../../../common/ApproveTransactionDrawer";
import { CheckIcon, CrossIcon } from "../../../common/Icon";

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
          component: (props: any) => <SendLoader {...props} />,
          title: `${token.ticker} / Send`,
          props: {
            blockchain,
            address,
          },
        },
      ]}
    />
  );
}

export function SendLoader({
  blockchain,
  address,
}: {
  blockchain: Blockchain;
  address: string;
}) {
  const [token] = useLoader(blockchainTokenData({ blockchain, address }), null);
  if (!token) return <></>;
  return <Send blockchain={blockchain} token={token} />;
}

export function Send({
  blockchain,
  token,
}: {
  blockchain: Blockchain;
  token: TokenData;
}) {
  const classes = useStyles() as any;
  const { close } = useDrawerContext();
  const { title, setTitle } = useNavStack();
  const { provider: solanaProvider } = useAnchorContext();
  const ethereumCtx = BACKPACK_FEATURE_MULTICHAIN
    ? useEthereumCtx()
    : undefined;
  const [openDrawer, setOpenDrawer] = useState(false);
  const [address, setAddress] = useState("");
  const [amount, setAmount] = useState<BigNumber | undefined>(undefined);
  const [feeOffset, setFeeOffset] = useState(BigNumber.from(0));

  useEffect(() => {
    const prev = title;
    setTitle(`Send ${token.ticker}`);
    return () => {
      setTitle(prev);
    };
  }, []);

  const {
    isValidAddress,
    isFreshAddress: _,
    isErrorAddress,
  } = useIsValidAddress(blockchain, address, solanaProvider.connection);

  useEffect(() => {
    if (!token) return;
    if (token.mint === SOL_NATIVE_MINT) {
      // When sending SOL, account for the tx fee and rent exempt minimum.
      setFeeOffset(
        BigNumber.from(5000).add(
          BigNumber.from(NATIVE_ACCOUNT_RENT_EXEMPTION_LAMPORTS)
        )
      );
    } else if (token.address === ETH_NATIVE_MINT) {
      // 21,000 GWEI for a standard ETH transfer
      setFeeOffset(
        BigNumber.from("21000")
          .mul(ethereumCtx?.feeData.maxFeePerGas!)
          .add(
            BigNumber.from("21000").mul(
              ethereumCtx?.feeData.maxPriorityFeePerGas!
            )
          )
      );
    }
  }, [blockchain, token]);

  const amountSubFee = BigNumber.from(token!.nativeBalance).sub(feeOffset);
  const maxAmount = amountSubFee.gt(0) ? amountSubFee : BigNumber.from(0);
  const exceedsBalance = amount && amount.gt(maxAmount);
  const isSendDisabled = !isValidAddress || amount === null || !!exceedsBalance;
  const isAmountError = amount && exceedsBalance;

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
              setValue={(address: string) => setAddress(address.trim())}
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
          {blockchain === Blockchain.SOLANA && (
            <SendSolanaConfirmationCard
              token={token}
              destinationAddress={address}
              amount={amount!}
              close={() => {
                setOpenDrawer(false);
                close();
              }}
            />
          )}
          {blockchain === Blockchain.ETHEREUM && (
            <SendEthereumConfirmationCard
              token={token}
              destinationAddress={address}
              amount={amount!}
              close={() => {
                setOpenDrawer(false);
                close();
              }}
            />
          )}
        </ApproveTransactionDrawer>
      </div>
    </form>
  );
}

//
// Displays token amount header with logo.
//
// TODO: similar compoennt in swap code, make one and move to common.
//
export const TokenAmountDisplay: React.FC<{
  style?: React.CSSProperties;
  token: {
    logo?: string;
    ticker?: string;
    decimals: number;
  };
  amount: BigNumber;
  displayLogo?: boolean;
}> = ({ style, token, amount, displayLogo = true }) => {
  const theme = useCustomTheme();

  return (
    <div
      style={{
        display: "flex",
        width: "100%",
        ...style,
      }}
    >
      {/* Dummy padding to center flex content */}
      <div style={{ flex: 1 }} />
      {displayLogo && (
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
      )}
      <Typography
        style={{
          color: theme.custom.colors.fontColor,
          fontWeight: 500,
          fontSize: "30px",
          lineHeight: "36px",
          textAlign: "center",
          display: "flex",
        }}
      >
        <span
          style={{
            display: "inline-block",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            maxWidth: `${displayLogo ? "208px" : "240px"}`,
          }}
        >
          {ethers.utils.formatUnits(amount, token.decimals)}
        </span>
        <span style={{ whiteSpace: "pre" }}> {token.ticker}</span>
      </Typography>
      {/* Dummy padding to center flex content */}
      <div style={{ flex: 1 }} />
    </div>
  );
};

export function Sending({
  blockchain,
  amount,
  token,
  signature,
  isComplete,
  titleOverride,
}: {
  blockchain: Blockchain;
  amount: BigNumber;
  token: any;
  signature: string;
  isComplete: boolean;
  titleOverride?: string;
}) {
  const theme = useCustomTheme();
  const nav = useNavigation();
  const drawer = useDrawerContext();
  const explorer = useBlockchainExplorer(blockchain);
  const connectionUrl = useBlockchainConnectionUrl(blockchain);
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
        {titleOverride ? titleOverride : isComplete ? "Sent" : "Sending..."}
      </Typography>
      <TokenAmountDisplay
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
          <Loading
            size={48}
            iconStyle={{
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
        {explorer && connectionUrl && (
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
        )}
      </div>
    </div>
  );
}

export function Error({
  blockchain,
  signature,
  onRetry,
  error,
}: {
  blockchain: Blockchain;
  signature: string;
  error: string;
  onRetry: () => void;
}) {
  const explorer = useBlockchainExplorer(blockchain);
  const connectionUrl = useBlockchainConnectionUrl(blockchain);
  const theme = useCustomTheme();

  return (
    <div
      style={{
        height: "340px",
        display: "flex",
        justifyContent: "space-between",
        flexDirection: "column",
        padding: "16px",
      }}
    >
      <div
        style={{
          marginTop: "8px",
          textAlign: "center",
        }}
      >
        <Typography
          style={{
            marginBottom: "16px",
            color: theme.custom.colors.fontColor,
          }}
        >
          Error
        </Typography>
        <div
          style={{
            height: "48px",
          }}
        >
          <CrossIcon />
        </div>
        <Typography
          style={{
            marginTop: "16px",
            marginBottom: "16px",
            overflow: "hidden",
            textOverflow: "ellipsis",
            color: theme.custom.colors.fontColor,
          }}
        >
          {error}
        </Typography>
        {explorer && connectionUrl && signature && (
          <SecondaryButton
            style={{
              height: "40px",
              width: "147px",
            }}
            buttonLabelStyle={{
              fontSize: "14px",
            }}
            label={"View Explorer"}
            onClick={() =>
              window.open(
                explorerUrl(explorer, signature, connectionUrl),
                "_blank"
              )
            }
          />
        )}
      </div>
      <PrimaryButton label={"Retry"} onClick={() => onRetry()} />
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
        setAddressError(false);
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
