/* eslint-disable react-hooks/exhaustive-deps */
import React, { type ChangeEvent, useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
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
  toDisplayBalance,
  toTitleCase,
} from "@coral-xyz/common";
import {
  CheckIcon,
  CrossIcon,
  DangerButton,
  Loading,
  LocalImage,
  MaxLabel,
  PrimaryButton,
  SecondaryButton,
  TextFieldLabel,
  TextInput,
} from "@coral-xyz/react-common";
import type { TokenDataWithPrice } from "@coral-xyz/recoil";
import {
  blockchainTokenData,
  useActiveWallet,
  useAnchorContext,
  useBlockchainConnectionUrl,
  useBlockchainExplorer,
  useBlockchainTokenAccount,
  useDarkMode,
  useEthereumCtx,
  useFriendship,
  useLoader,
  useUser,
} from "@coral-xyz/recoil";
import { styles as makeStyles, useCustomTheme } from "@coral-xyz/themes";
import { Typography } from "@mui/material";
import { TldParser } from "@onsol/tldparser";
import type { Connection } from "@solana/web3.js";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import { BigNumber, ethers } from "ethers";

import { ApproveTransactionDrawer } from "../../../common/ApproveTransactionDrawer";
import { CopyablePublicKey } from "../../../common/CopyablePublicKey";
import { useDrawerContext } from "../../../common/Layout/Drawer";
import { useNavigation } from "../../../common/Layout/NavStack";
import { TokenAmountHeader } from "../../../common/TokenAmountHeader";
import { TokenInputField } from "../../../common/TokenInput";

import { SendEthereumConfirmationCard } from "./Ethereum";
import { SendSolanaConfirmationCard } from "./Solana";
import { WithHeaderButton } from "./Token";

const useStyles = makeStyles((theme) => ({
  topImage: {
    width: 80,
  },
  topImageOuter: {
    width: 80,
    height: 80,
    border: `solid 3px ${theme.custom.colors.avatarIconBackground}`,
    borderRadius: "50%",
    display: "inline-block",
    overflow: "hidden",
  },
  horizontalCenter: {
    display: "flex",
    justifyContent: "center",
  },
  container: {
    alignItems: "center",
    display: "flex",
    flexDirection: "column",
    height: "100%",
  },
  topHalf: {
    paddingTop: "24px",
    flex: 1,
  },
  textRoot: {
    marginTop: "0 !important",
    marginBottom: "0 !important",
    "& .MuiOutlinedInput-root": {
      backgroundColor: `${theme.custom.colors.nav} !important`,
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
  publicKey: string;
}) {
  // publicKey should only be undefined if the user is in single-wallet mode
  // (rather than aggregate mode).
  const activeWallet = useActiveWallet();
  publicKey = publicKey ?? activeWallet.publicKey;

  const token = useBlockchainTokenAccount({
    publicKey,
    blockchain,
    tokenAddress: address,
  });

  return (
    <WithHeaderButton
      label="Send"
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
  const activeWallet = useActiveWallet();
  const publicKeyStr = publicKey ?? activeWallet.publicKey;

  const [token] = useLoader(
    blockchainTokenData({
      publicKey: publicKeyStr,
      blockchain,
      tokenAddress: address,
    }),
    null
  );

  if (!token) return null;
  return <Send blockchain={blockchain} token={token} />;
}

export function Send({
  blockchain,
  token,
  to,
}: {
  blockchain: Blockchain;
  token: TokenDataWithPrice;
  to?: {
    address: string;
    username?: string;
    walletName?: string;
    image?: string;
    uuid?: string;
  };
}) {
  const classes = useStyles();
  const { uuid } = useUser();
  const drawer = useDrawerContext();
  const nav = useNavigation();
  const { provider: solanaProvider } = useAnchorContext();
  const ethereumCtx = useEthereumCtx();
  const [openDrawer, setOpenDrawer] = useState(false);
  const [address, setAddress] = useState(to?.address || "");
  const [amount, setAmount] = useState<BigNumber | null>(null);
  const [feeOffset, setFeeOffset] = useState(BigNumber.from(0));
  const [message, setMessage] = useState("");
  const friendship = useFriendship({ userId: to?.uuid || "" });

  useEffect(() => {
    const prev = nav.title;
    nav.setOptions({ headerTitle: `Send ${token.ticker}` });
    return () => {
      nav.setOptions({ headerTitle: prev });
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
  const isSendDisabled =
    !isValidAddress || amount === null || amount.eq(0) || !!exceedsBalance;
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
    sendButton = <DangerButton disabled label="Invalid Address" />;
  } else if (isAmountError) {
    sendButton = <DangerButton disabled label="Insufficient Balance" />;
  } else {
    sendButton = (
      <PrimaryButton
        disabled={isSendDisabled}
        label="Review"
        type="submit"
        data-testid="Send"
      />
    );
  }

  const onViewBalances = () => {
    drawer.close();
  };

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
      {!to ? (
        <SendV1
          address={address}
          sendButton={sendButton}
          amount={amount}
          token={token}
          blockchain={blockchain}
          isAmountError={isAmountError}
          isErrorAddress={isAmountError}
          maxAmount={maxAmount}
          setAddress={setAddress}
          setAmount={setAmount}
        />
      ) : null}
      {to ? (
        <SendV2
          to={to}
          message={message}
          setMessage={setMessage}
          sendButton={sendButton}
          amount={amount}
          token={token}
          blockchain={blockchain}
          isAmountError={isAmountError}
          isErrorAddress={isAmountError}
          maxAmount={maxAmount}
          setAddress={setAddress}
          setAmount={setAmount}
        />
      ) : null}
      <ApproveTransactionDrawer
        openDrawer={openDrawer}
        setOpenDrawer={setOpenDrawer}
      >
        <SendConfirmComponent
          onComplete={async () => {
            if (
              to?.uuid &&
              to?.uuid !== uuid &&
              friendship?.id &&
              to?.uuid !== uuid &&
              blockchain === Blockchain.SOLANA
            ) {
              // const client_generated_uuid = uuidv4();
              // createEmptyFriendship(uuid, to?.uuid, {
              //   last_message_sender: uuid,
              //   last_message_timestamp: new Date().toISOString(),
              //   last_message: message,
              //   last_message_client_uuid: client_generated_uuid,
              // });
              //
              // SignalingManager.getInstance().send({
              //   type: "CHAT_MESSAGES",
              //   payload: {
              //     room: friendship?.id?.toString(),
              //     type: "individual",
              //     messages: [
              //       {
              //         client_generated_uuid: client_generated_uuid,
              //         message,
              //         message_kind: "transaction",
              //         message_metadata: {
              //           final_tx_signature: txSig,
              //         },
              //       },
              //     ],
              //   },
              // });
              // await navOuter.toRoot();
              // await background.request({
              //   method: UI_RPC_METHOD_NAVIGATION_ACTIVE_TAB_UPDATE,
              //   params: [TAB_MESSAGES],
              // });
              // push({
              //   title: `@${to?.username}`,
              //   componentId: NAV_COMPONENT_MESSAGE_CHAT,
              //   componentProps: {
              //     userId: to?.uuid,
              //     id: to?.uuid,
              //     username: to?.username,
              //   },
              // });
            }
          }}
          token={token}
          destinationAddress={destinationAddress}
          destinationUser={
            (to && to.uuid && to.username && to.image
              ? to
              : undefined) as React.ComponentProps<
              typeof SendConfirmComponent
            >["destinationUser"]
          }
          amount={amount!}
          onViewBalances={onViewBalances}
        />
      </ApproveTransactionDrawer>
    </form>
  );
}

function SendV1({
  blockchain,
  address,
  isErrorAddress,
  token,
  maxAmount,
  setAmount,
  amount,
  isAmountError,
  sendButton,
  setAddress,
}: any) {
  const classes = useStyles();
  return (
    <>
      <div className={classes.topHalf}>
        <div style={{ marginBottom: "40px" }}>
          <TextFieldLabel
            leftLabel="Send to"
            rightLabel=""
            style={{ marginLeft: "24px", marginRight: "24px" }}
          />
          <div style={{ margin: "0 12px" }}>
            <TextInput
              placeholder={`${toTitleCase(blockchain)} address`}
              value={address}
              setValue={(e) => {
                setAddress(e.target.value.trim());
              }}
              error={isErrorAddress}
              inputProps={{
                name: "to",
                spellCheck: "false",
                // readOnly: to ? true : false,
              }}
              // startAdornment={
              //   to?.image ? <UserIcon size={32} image={to?.image} /> : <></>
              // }
              margin="none"
            />
          </div>
        </div>
        <div>
          <TextFieldLabel
            leftLabel="Amount"
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
      <ButtonContainer>{sendButton}</ButtonContainer>
    </>
  );
}

function ButtonContainer({ children }: { children: React.ReactNode }) {
  return <View style={buttonContainerStyles.container}>{children}</View>;
}

const buttonContainerStyles = StyleSheet.create({
  container: {
    width: "100%",
    paddingHorizontal: 12,
    paddingBottom: 16,
    paddingTop: 25,
  },
});

function SendV2({ token, maxAmount, setAmount, sendButton, to }: any) {
  const classes = useStyles();
  const theme = useCustomTheme();
  const isDarkMode = useDarkMode();
  // eslint-disable-next-line react/hook-use-state
  const [_amount, _setAmount] = useState<string>("");

  return (
    <>
      <div
        style={{
          paddingTop: "40px",
          flex: 1,
        }}
      >
        <div>
          <div className={classes.horizontalCenter} style={{ marginBottom: 6 }}>
            <div className={classes.topImageOuter}>
              <LocalImage
                className={classes.topImage}
                src={
                  to?.image ||
                  `https://avatars.backpack.workers.dev/${to?.address}`
                }
                style={{ width: 80, height: 80 }}
              />
            </div>
          </div>
          <div className={classes.horizontalCenter}>
            {to.walletName || to.username ? (
              <div
                style={{
                  color: theme.custom.colors.fontColor,
                  fontSize: 16,
                  fontWeight: 500,
                }}
              >
                {to.walletName ? to.walletName : `@${to.username}`}
              </div>
            ) : null}
          </div>
          <div className={classes.horizontalCenter} style={{ marginTop: 4 }}>
            <CopyablePublicKey publicKey={to?.address} />
          </div>
        </div>
        <div>
          <div
            style={{ display: "flex", justifyContent: "center", width: "100" }}
          >
            <input
              placeholder="0"
              autoFocus
              type="text"
              style={{
                marginTop: "40px",
                outline: "none",
                background: "transparent",
                border: "none",
                fontWeight: 600,
                fontSize: 48,
                height: 48,
                color: theme.custom.colors.fontColor,
                textAlign: "center",
                width: "100%",
                // @ts-ignore
                fontFamily: theme.typography.fontFamily,
              }}
              value={_amount}
              onChange={({
                target: { value },
              }: ChangeEvent<HTMLInputElement>) => {
                try {
                  const parsedVal =
                    value.length === 1 && value[0] === "." ? "0." : value;

                  _setAmount(parsedVal);

                  const num =
                    parsedVal === "" || parsedVal === "0."
                      ? 0.0
                      : parseFloat(parsedVal);

                  if (num >= 0) {
                    setAmount(
                      ethers.utils.parseUnits(num.toString(), token.decimals)
                    );
                  }
                } catch (err) {
                  // Do nothing.
                }
              }}
            />
          </div>
          <div
            style={{ display: "flex", justifyContent: "center", marginTop: 20 }}
          >
            <img
              src={token.logo}
              style={{
                height: 35,
                borderRadius: "50%",
                marginRight: 5,
              }}
            />
            <div
              style={{
                color: theme.custom.colors.smallTextColor,
                fontSize: 24,
              }}
            >
              {token.ticker}
            </div>
          </div>
          <div
            style={{ display: "flex", justifyContent: "center", marginTop: 20 }}
          >
            <div
              style={{
                display: "inline-flex",
                color: theme.custom.colors.fontColor,
                cursor: "pointer",
                fontSize: 14,
                border: `2px solid ${
                  isDarkMode
                    ? theme.custom.colors.bg2
                    : theme.custom.colors.border1
                }`,
                padding: "4px 12px",
                borderRadius: 8,
                marginTop: 5,
                background: theme.custom.colors.bg3,
              }}
              onClick={() => {
                const a = toDisplayBalance(maxAmount, token.decimals);
                _setAmount(a);
                setAmount(maxAmount);
              }}
            >
              Max: {toDisplayBalance(maxAmount, token.decimals)} {token.ticker}
            </div>
          </div>
        </div>
      </div>
      <ButtonContainer>{sendButton}</ButtonContainer>
    </>
  );
}

export function Sending({
  blockchain,
  amount,
  token,
  signature,
  isComplete,
  titleOverride,
  onViewBalances,
}: {
  blockchain: Blockchain;
  amount: BigNumber;
  token: any;
  signature: string;
  isComplete: boolean;
  titleOverride?: string;
  onViewBalances?: () => void;
}) {
  const theme = useCustomTheme();
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
        {explorer && connectionUrl ? (
          <SecondaryButton
            onClick={async () => {
              if (isComplete) {
                drawer.close();
                if (onViewBalances) onViewBalances();
              } else {
                window.open(explorerUrl(explorer, signature, connectionUrl));
              }
            }}
            label={isComplete ? "View Balances" : "View Explorer"}
          />
        ) : null}
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
        {explorer && connectionUrl && signature ? (
          <SecondaryButton
            style={{
              height: "40px",
              width: "147px",
            }}
            buttonLabelStyle={{
              fontSize: "14px",
            }}
            label="View Explorer"
            onClick={() =>
              window.open(
                explorerUrl(explorer, signature, connectionUrl),
                "_blank"
              )
            }
          />
        ) : null}
      </div>
      <PrimaryButton label="Retry" onClick={() => onRetry()} />
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
        if (address.endsWith(".sol")) {
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

        // ANS by ONSOL
        if (!pubkey && address.split(".").length === 2) {
          try {
            // address would be e.g. miester.poor
            const parser = new TldParser(solanaConnection);
            const owner = await parser.getOwnerFromDomainTld(address);
            if (!owner) {
              setAddressError(true);
              // Not a valid domain don't bother continuing since it has a dot in it.
              return;
            }
            pubkey = owner;
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
