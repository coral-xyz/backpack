import { useEffect, useRef, useState } from "react";
import { RichMentionsInput } from "react-rich-mentions";
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
  NAV_COMPONENT_MESSAGE_CHAT,
  NAV_COMPONENT_MESSAGE_PROFILE,
  SOL_NATIVE_MINT,
  TAB_MESSAGES,
  toDisplayBalance,
  toTitleCase,
  UI_RPC_METHOD_NAVIGATION_ACTIVE_TAB_UPDATE,
  walletAddressDisplay,
} from "@coral-xyz/common";
import { createEmptyFriendship } from "@coral-xyz/db";
import {
  CheckIcon,
  CrossIcon,
  DangerButton,
  Loading,
  LocalImage,
  MaxLabel,
  PrimaryButton,
  SecondaryButton,
  SignalingManager,
  TextFieldLabel,
  TextInput,
  UserIcon,
} from "@coral-xyz/react-common";
import type { TokenDataWithPrice } from "@coral-xyz/recoil";
import {
  blockchainTokenData,
  useActiveWallet,
  useAnchorContext,
  useBackgroundClient,
  useBlockchainActiveWallet,
  useBlockchainConnectionUrl,
  useBlockchainExplorer,
  useBlockchainTokenAccount,
  useDarkMode,
  useEthereumCtx,
  useFriendship,
  useLoader,
  useNavigation,
  useUser,
} from "@coral-xyz/recoil";
import { styles, useCustomTheme } from "@coral-xyz/themes";
import { TextField, Typography } from "@mui/material";
import { TldParser } from "@onsol/tldparser";
import type { Connection } from "@solana/web3.js";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import { BigNumber, ethers } from "ethers";
import { v4 as uuidv4 } from "uuid";

import { ApproveTransactionDrawer } from "../../../common/ApproveTransactionDrawer";
import { useDrawerContext } from "../../../common/Layout/Drawer";
import { useNavigation as useNavigationEphemeral } from "../../../common/Layout/NavStack";
import { TokenAmountHeader } from "../../../common/TokenAmountHeader";
import { TokenInputField } from "../../../common/TokenInput";

import { SendEthereumConfirmationCard } from "./Ethereum";
import { SendSolanaConfirmationCard } from "./Solana";
import { WithHeaderButton } from "./Token";

const useStyles = styles((theme) => ({
  topImage: {
    width: 130,
  },
  topImageOuter: {
    width: 130,
    height: 130,
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
    display: "flex",
    flexDirection: "column",
    height: "100%",
  },
  topHalf: {
    paddingTop: "24px",
    flex: 1,
  },
  inputContainer: {
    paddingLeft: "12px",
    paddingRight: "12px",
    marginBottom: -8,
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
  publicKey: string;
}) {
  // publicKey should only be undefined if the user is in single-wallet mode
  // (rather than aggregate mode).
  publicKey = publicKey ?? useActiveWallet().publicKey;
  const token = useBlockchainTokenAccount({
    publicKey,
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
  to,
}: {
  blockchain: Blockchain;
  token: TokenDataWithPrice;
  to?: {
    address: string;
    username?: string;
    image?: string;
    uuid?: string;
  };
}) {
  const classes = useStyles() as any;
  const { uuid } = useUser();
  const nav = useNavigationEphemeral();
  const navOuter = useNavigation();
  const { provider: solanaProvider } = useAnchorContext();
  const ethereumCtx = useEthereumCtx();
  const [openDrawer, setOpenDrawer] = useState(false);
  const [address, setAddress] = useState(to?.address || "");
  const [amount, setAmount] = useState<BigNumber | undefined>(undefined);
  const [feeOffset, setFeeOffset] = useState(BigNumber.from(0));
  const [message, setMessage] = useState("");
  const friendship = useFriendship({ userId: to?.uuid || "" });
  const theme = useCustomTheme();
  const { push } = useNavigation();
  const background = useBackgroundClient();

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
        label="Review"
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
      <>
        {!to && (
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
        )}
        {to && (
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
        )}
        <ApproveTransactionDrawer
          openDrawer={openDrawer}
          setOpenDrawer={setOpenDrawer}
        >
          <SendConfirmComponent
            onComplete={async (txSig) => {
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
              to?.uuid && to?.username && to?.image
                ? {
                    username: to.username,
                    image: to.image,
                  }
                : undefined
            }
            amount={amount!}
          />
        </ApproveTransactionDrawer>
      </>
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
            leftLabel={"Send to"}
            rightLabel={""}
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
      <div className={classes.buttonContainer}>{sendButton}</div>
    </>
  );
}

function SendV2({
  token,
  maxAmount,
  setAmount,
  sendButton,
  to,
  message,
  setMessage,
  blockchain,
}: any) {
  const classes = useStyles();
  const theme = useCustomTheme();
  const { uuid } = useUser();
  const editableRef = useRef<any>();
  const isDarkMode = useDarkMode();

  const cursorToEnd = () => {
    //@ts-ignore
    editableRef.current.focus();
    //@ts-ignore
    document.execCommand("selectAll", false, null);
    //@ts-ignore
    document.getSelection().collapseToEnd();
  };

  useEffect(() => {
    if (editableRef.current) {
      cursorToEnd();
    }
  }, [editableRef]);

  return (
    <>
      <div className={classes.topHalf}>
        <div style={{ marginBottom: "10px" }}>
          <div
            className={classes.horizontalCenter}
            style={{ marginBottom: 10 }}
          >
            <div className={classes.topImageOuter}>
              <LocalImage
                className={classes.topImage}
                src={
                  to?.image ||
                  `https://avatars.backpack.workers.dev/${to?.address}`
                }
                style={{ width: 130, height: 130 }}
              />
            </div>
          </div>
          <div className={classes.horizontalCenter}>
            {to.username && (
              <div
                style={{
                  color: theme.custom.colors.fontColor,
                  fontSize: 20,
                  fontWeight: 500,
                }}
              >
                {`${to.username}`}
              </div>
            )}
          </div>
          <div className={classes.horizontalCenter}>
            <div
              style={{
                color: theme.custom.colors.fontColor,
                fontSize: 18,
                fontWeight: 500,
              }}
            >
              ({walletAddressDisplay(to.address)})
            </div>
          </div>
        </div>
        <div>
          <div
            onKeyDown={() => {
              cursorToEnd();
            }}
            style={{ display: "flex", justifyContent: "center" }}
          >
            <img
              src={token.logo}
              style={{
                width: 44,
                height: 44,
                borderRadius: "50%",
                marginTop: 14,
                marginRight: 5,
              }}
            />
            <div
              style={{
                fontWeight: 600,
                fontSize: 48,
                display: "flex",
                color: theme.custom.colors.fontColor,
              }}
            >
              <div
                onKeyDown={() => {
                  cursorToEnd();
                }}
                onSelect={() => {
                  cursorToEnd();
                }}
                ref={editableRef}
                style={{ marginRight: 5 }}
                onInput={(e) => {
                  const decimalIndex =
                    e.currentTarget.textContent?.indexOf(".");
                  //@ts-ignore
                  if (
                    !e.currentTarget.textContent ||
                    //@ts-ignore
                    (isNaN(e.currentTarget.textContent) &&
                      decimalIndex !== e.currentTarget.textContent.length - 1)
                  ) {
                    e.currentTarget.innerHTML = "0";
                    setAmount(ethers.utils.parseUnits("0", token.decimals));
                  } else {
                    const amount = e.currentTarget.textContent;
                    const decimalIndex = amount.indexOf(".");
                    if (decimalIndex === -1) {
                      e.currentTarget.innerHTML = parseFloat(amount).toString();
                    } else {
                      e.currentTarget.innerHTML = amount.toString();
                    }
                    // Restrict the input field to the same amount of decimals as the token
                    const truncatedAmount =
                      decimalIndex >= 0
                        ? amount.substring(0, decimalIndex) +
                          amount.substring(
                            decimalIndex,
                            decimalIndex + token.decimals + 1
                          )
                        : amount;
                    setAmount(
                      ethers.utils.parseUnits(
                        amount.endsWith(".")
                          ? truncatedAmount + "0"
                          : truncatedAmount,
                        token.decimals
                      )
                    );
                  }
                  cursorToEnd();
                }}
                contentEditable={true}
              >
                0
              </div>{" "}
              <div style={{ marginLeft: 3, outline: "0px solid transparent" }}>
                {" "}
                {token.ticker}
              </div>
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <div
              style={{
                display: "inline-flex",
                color: theme.custom.colors.fontColor,
                cursor: "pointer",
                background: isDarkMode
                  ? theme.custom.colors.bg2
                  : theme.custom.colors.bg3,
                padding: "4px 12px",
                borderRadius: 8,
              }}
              onClick={() => {
                editableRef.current.innerHTML = toDisplayBalance(
                  maxAmount,
                  token.decimals
                );
                setAmount(maxAmount);
              }}
            >
              Max
            </div>
          </div>
        </div>
      </div>
      <div>
        <div className={classes.inputContainer}>
          {to &&
            to.uuid &&
            to.uuid !== uuid &&
            blockchain === Blockchain.SOLANA && (
              <TextField
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 6,
                    border: "2px solid rgba(255, 255, 255, 0.1);",
                    color: theme.custom.colors.fontColor,
                  },
                }}
                fullWidth
                className={classes.input}
                placeholder={"Add a message (Optional)"}
                style={{
                  outline: "0px solid transparent",
                  color: theme.custom.colors.fontColor,
                  fontSize: "15px",
                }}
                onChange={(e) => setMessage(e.target.value)}
                value={message}
              />
            )}
        </div>
        <div className={classes.buttonContainer}>{sendButton}</div>
      </div>
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
        console.log("ext:account", account);

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
