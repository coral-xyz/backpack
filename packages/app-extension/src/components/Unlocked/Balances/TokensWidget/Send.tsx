import { useEffect, useState } from "react";
import {
  getHashedName,
  getNameAccountKey,
  NameRegistryState,
} from "@bonfida/spl-name-service";
import {
  Blockchain,
  ETH_NATIVE_MINT,
  explorerUrl,
  NATIVE_ACCOUNT_RENT_EXEMPTION_LAMPORTS,
  SOL_NATIVE_MINT,
  toTitleCase,
} from "@coral-xyz/common";
import {
  CheckIcon,
  CrossIcon,
  DangerButton,
  Loading,
  PrimaryButton,
  SecondaryButton,
  TextInput,
} from "@coral-xyz/react-common";
import type { TokenData} from "@coral-xyz/recoil";
import {   blockchainTokenData,
useActiveWallet ,
  useAnchorContext,
  useBlockchainActiveWallet,
  useBlockchainConnectionUrl,
  useBlockchainExplorer,
  useBlockchainTokenAccount,
  useEthereumCtx,
  useLoader,
  useNavigation,
} from "@coral-xyz/recoil";
import { styles, useCustomTheme } from "@coral-xyz/themes";
import { Typography } from "@mui/material";
import type { Connection } from "@solana/web3.js";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import { BigNumber, ethers } from "ethers";

import { TextFieldLabel } from "../../../common";
import { ApproveTransactionDrawer } from "../../../common/ApproveTransactionDrawer";
import { useDrawerContext } from "../../../common/Layout/Drawer";
import { useNavStack } from "../../../common/Layout/NavStack";
import { MaxLabel } from "../../../common/MaxLabel";
import { TokenAmountHeader } from "../../../common/TokenAmountHeader";
import { TokenInputField } from "../../../common/TokenInput";

import { SendEthereumConfirmationCard } from "./Ethereum";
import { SendSolanaConfirmationCard } from "./Solana";
import { WithHeaderButton } from "./Token";

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
  publicKey,
  blockchain,
  address,
}: {
  blockchain: Blockchain;
  address: string;
  publicKey?: string;
}) {
  const wallet = useBlockchainActiveWallet(blockchain);
  const token = useBlockchainTokenAccount({
    publicKey: wallet.publicKey.toString(),
    blockchain,
    tokenAddress: address,
  });
  return (
    <WithHeaderButton
      label={"Send"}
      routes={[
        {
          name: "send",
          component: (props: any) => <SendLoader {...props} />,
          title: `${token?.ticker || ""} / Send`,
          props: {
            blockchain,
            address,
            publicKey,
          },
        },
      ]}
    />
  );
}

export function SendLoader({
  publicKey,
  blockchain,
  address,
}: {
  publicKey?: string;
  blockchain: Blockchain;
  address: string;
}) {
  // publicKey should only be undefined if the user is in single-wallet mode
  // (rather than aggregate mode).
  const publicKeyStr = publicKey ?? useActiveWallet().publicKey;
  const [token] = useLoader(
    blockchainTokenData({
      publicKey: publicKeyStr,
      blockchain,
      tokenAddress: address,
    }),
    null
  );
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
  const { title, setTitle } = useNavStack();
  const { provider: solanaProvider } = useAnchorContext();
  const ethereumCtx = useEthereumCtx();
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
    isErrorAddress,
    normalizedAddress: destinationAddress,
  } = useIsValidAddress(
    blockchain,
    address,
    solanaProvider.connection,
    ethereumCtx.provider
  );

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

  const SendConfirmComponent = {
    [Blockchain.SOLANA]: SendSolanaConfirmationCard,
    [Blockchain.ETHEREUM]: SendEthereumConfirmationCard,
  }[blockchain];

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
            <TextInput
              placeholder={`${toTitleCase(blockchain)} address`}
              value={address}
              setValue={(e) => setAddress(e.target.value.trim())}
              error={isErrorAddress}
              inputProps={{
                name: "to",
                spellCheck: "false",
              }}
              margin="none"
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
          <SendConfirmComponent
            token={token}
            destinationAddress={destinationAddress}
            amount={amount!}
          />
        </ApproveTransactionDrawer>
      </div>
    </form>
  );
}

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
      <TokenAmountHeader
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

// TODO(peter) share between extension/mobile
export function useIsValidAddress(
  blockchain: Blockchain,
  address: string,
  solanaConnection?: Connection,
  ethereumProvider?: ethers.providers.Provider
) {
  const [addressError, setAddressError] = useState<boolean>(false);
  const [isFreshAccount, setIsFreshAccount] = useState<boolean>(false); // Not used for now.
  const [accountValidated, setAccountValidated] = useState<boolean>(false);
  const [normalizedAddress, setNormalizedAddress] = useState<string>(address);

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
        let pubkey;

        if (!solanaConnection) {
          return;
        }

        // SNS Domain
        if (address.includes(".sol")) {
          try {
            const hashedName = await getHashedName(address.replace(".sol", ""));
            const nameAccountKey = await getNameAccountKey(
              hashedName,
              undefined,
              new PublicKey("58PwtjSDuFHuUkYjH9BYnnQKHfwo9reZhC2zMJv9JPkx") // SOL TLD Authority
            );

            const owner = await NameRegistryState.retrieve(
              solanaConnection,
              nameAccountKey
            );

            pubkey = owner.registry.owner;
          } catch (e) {
            setAddressError(true);
            return;
          }
        }

        if (!pubkey) {
          // Solana address validation
          try {
            pubkey = new PublicKey(address);
          } catch (err) {
            setAddressError(true);
            // Not valid address so don't bother validating it.
            return;
          }
        }

        const account = await solanaConnection?.getAccountInfo(pubkey);

        // Null data means the account has no lamports. This is valid.
        if (!account) {
          setIsFreshAccount(true);
          setAccountValidated(true);
          setNormalizedAddress(pubkey.toString());
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
        setNormalizedAddress(pubkey.toString());
      } else if (blockchain === Blockchain.ETHEREUM) {
        // Ethereum address validation
        let checksumAddress;

        if (!ethereumProvider) {
          return;
        }

        if (address.includes(".eth")) {
          try {
            checksumAddress = await ethereumProvider?.resolveName(address);
          } catch (e) {
            setAddressError(true);
            return;
          }
        }

        if (!checksumAddress) {
          try {
            checksumAddress = ethers.utils.getAddress(address);
          } catch (e) {
            setAddressError(true);
            return;
          }
        }

        setAddressError(false);
        setAccountValidated(true);
        setNormalizedAddress(checksumAddress);
      }
    })();
  }, [address]);

  return {
    isValidAddress: accountValidated,
    isFreshAddress: isFreshAccount,
    isErrorAddress: addressError,
    normalizedAddress: normalizedAddress,
  };
}
