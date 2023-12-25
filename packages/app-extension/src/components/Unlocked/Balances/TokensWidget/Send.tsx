import { type ChangeEvent, useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { useApolloClient } from "@apollo/client";
import type { Blockchain } from "@coral-xyz/common";
import { toDisplayBalance, toTitleCase, wait } from "@coral-xyz/common";
import {
  GET_TOKEN_BALANCES_QUERY,
  GET_TRANSACTIONS_FOR_TOKEN,
  type ProviderId,
} from "@coral-xyz/data-components";
import { useTranslation } from "@coral-xyz/i18n";
import {
  CheckIcon,
  CrossIcon,
  Loading,
  MaxLabel,
  PrimaryButton,
  SecondaryButton,
  TextFieldLabel,
  TextInput,
} from "@coral-xyz/react-common";
import type { TokenDataWithPrice } from "@coral-xyz/recoil";
import {
  useActiveWallet,
  useAnchorContext,
  useBlockchainConnectionUrl,
  useBlockchainExplorer,
  useDarkMode,
  useEthereumCtx,
  useIsValidAddress,
} from "@coral-xyz/recoil";
import { explorerUrl } from "@coral-xyz/secure-background/legacyCommon";
import {
  BpDangerButton,
  IncognitoAvatar,
  temporarilyMakeStylesForBrowserExtension,
  useTheme,
} from "@coral-xyz/tamagui";
import { Typography } from "@mui/material";
import { BigNumber, ethers } from "ethers";

import { ApproveTransactionDrawer } from "../../../common/ApproveTransactionDrawer";
import { BLOCKCHAIN_COMPONENTS } from "../../../common/Blockchains";
import { CopyablePublicKey } from "../../../common/CopyablePublicKey";
import { useDrawerContext } from "../../../common/Layout/Drawer";
import { useNavigation } from "../../../common/Layout/NavStack";
import { TokenAmountHeader } from "../../../common/TokenAmountHeader";
import { TokenInputField } from "../../../common/TokenInput";

export const useStyles = temporarilyMakeStylesForBrowserExtension((theme) => ({
  topImageOuter: {
    width: 80,
    height: 80,
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
      backgroundColor: `${theme.custom?.colors.nav} !important`,
    },
  },
}));

export function Send({
  blockchain,
  token,
  to,
}: {
  blockchain: Blockchain;
  token: TokenDataWithPrice & { id: string };
  to?: {
    address: string;
    username?: string;
    walletName?: string;
    image?: string;
    uuid?: string;
  };
}) {
  const classes = useStyles();
  const active = useActiveWallet();
  const drawer = useDrawerContext();
  const nav = useNavigation();
  const { provider: solanaProvider } = useAnchorContext();
  const ethereumCtx = useEthereumCtx();
  const [openDrawer, setOpenDrawer] = useState(false);
  const [address, setAddress] = useState(to?.address || "");
  const [amount, setAmount] = useState<BigNumber | null>(null);
  const [strAmount, setStrAmount] = useState("");
  const [feeOffset, setFeeOffset] = useState(BigNumber.from(0));
  const [message, setMessage] = useState("");
  const { t } = useTranslation();
  const apollo = useApolloClient();

  useEffect(() => {
    const prev = nav.title;
    nav.setOptions({
      headerTitle: t("send_ticker", { ticker: token.ticker }),
    });
    return () => {
      nav.setOptions({ headerTitle: prev });
    };
  }, []); // eslint-disable-line

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
    setFeeOffset(
      BLOCKCHAIN_COMPONENTS[blockchain].MaxFeeOffset(
        { address: token.address, mint: token.mint },
        ethereumCtx
      )
    );
  }, [blockchain, token]); // eslint-disable-line

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
    sendButton = <BpDangerButton disabled label={t("invalid_address")} />;
  } else if (isAmountError) {
    sendButton = <BpDangerButton disabled label={t("insufficient_balance")} />;
  } else {
    sendButton = (
      <PrimaryButton
        disabled={isSendDisabled}
        label={t("review")}
        type="submit"
        data-testid="Send"
      />
    );
  }

  const onViewBalances = () => {
    drawer.close();
  };

  const { SendTokenConfirmationCard } = BLOCKCHAIN_COMPONENTS[blockchain];

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
          strAmount={strAmount}
          token={token}
          blockchain={blockchain}
          isAmountError={isAmountError}
          isErrorAddress={isAmountError}
          maxAmount={maxAmount}
          setAddress={setAddress}
          setAmount={setAmount}
          setStrAmount={setStrAmount}
        />
      ) : null}
      <ApproveTransactionDrawer
        openDrawer={openDrawer}
        setOpenDrawer={(val) => {
          if (!val) {
            setAmount(BigNumber.from(0));
            setStrAmount("");
          }
          setOpenDrawer(val);
        }}
      >
        <SendTokenConfirmationCard
          onComplete={async () => {
            await wait(2);
            await Promise.all([
              apollo.query({
                query: GET_TOKEN_BALANCES_QUERY,
                fetchPolicy: "network-only",
                variables: {
                  address: active.publicKey,
                  providerId: active.blockchain.toUpperCase() as ProviderId,
                },
              }),
              apollo.query({
                query: GET_TRANSACTIONS_FOR_TOKEN,
                fetchPolicy: "network-only",
                variables: {
                  address: active.publicKey,
                  transactionFilters: {
                    token: token.mint,
                  },
                  providerId: active.blockchain.toUpperCase() as ProviderId,
                },
              }),
            ]);
          }}
          onClose={() => {
            setOpenDrawer(false);
          }}
          token={token}
          destinationAddress={destinationAddress}
          destinationUser={
            (to && to.uuid && to.username && to.image
              ? to
              : undefined) as React.ComponentProps<
              typeof SendTokenConfirmationCard
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
  const { t } = useTranslation();
  return (
    <>
      <div className={classes.topHalf}>
        <div style={{ marginBottom: "40px" }}>
          <TextFieldLabel
            leftLabel={t("send_to")}
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
                name: t("to"),
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
            leftLabel={t("amount")}
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

function SendV2({
  token,
  maxAmount,
  setAmount,
  strAmount,
  setStrAmount,
  sendButton,
  to,
}: any) {
  const classes = useStyles();
  const theme = useTheme();
  const isDarkMode = useDarkMode();
  const { t } = useTranslation();

  return (
    <>
      <div
        style={{
          paddingTop: "40px",
          flex: 1,
        }}
      >
        <div>
          {to.uuid ? (
            <div
              className={classes.horizontalCenter}
              style={{ marginBottom: 6 }}
            >
              <div className={classes.topImageOuter}>
                <IncognitoAvatar uuid={to.uuid} size={80} fontSize={40} />
              </div>
            </div>
          ) : null}
          <div className={classes.horizontalCenter}>
            {to.walletName || to.username ? (
              <div
                style={{
                  color: theme.baseTextHighEmphasis.val,
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
                color: theme.baseTextHighEmphasis.val,
                textAlign: "center",
                width: "100%",
              }}
              value={strAmount}
              onChange={({
                target: { value },
              }: ChangeEvent<HTMLInputElement>) => {
                try {
                  const maxDecimals = token.decimals ?? 9;

                  const parsedVal = value
                    // remove all characters except for 0-9 and .
                    .replace(/[^\d.]/g, "")
                    // prepend a 0 if . is the first character
                    .replace(/^\.(\d+)?$/, "0.$1")
                    // remove any periods after the first one
                    .replace(/^(\d+\.\d*?)\./, "$1")
                    // trim to the number of decimals allowed for the token
                    .replace(
                      new RegExp(`^(\\d+\\.\\d{${maxDecimals}}).+`),
                      "$1"
                    );

                  if (!Number.isFinite(Number(parsedVal))) return;

                  setStrAmount(parsedVal);

                  if (parsedVal.endsWith(".")) {
                    // can't `throw new Error("trailing")` due to Error function
                    throw "trailing .";
                  }

                  const finalAmount = ethers.utils.parseUnits(
                    parsedVal,
                    maxDecimals
                  );

                  setAmount(finalAmount.isZero() ? null : finalAmount);
                } catch (err) {
                  setAmount(null);
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
                color: theme.baseTextMedEmphasis.val,
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
                color: theme.baseTextHighEmphasis.val,
                cursor: "pointer",
                fontSize: 14,
                border: `2px solid ${
                  isDarkMode
                    ? theme.baseBackgroundL2.val
                    : theme.baseBorderLight.val
                }`,
                padding: "4px 12px",
                borderRadius: 8,
                marginTop: 5,
                background: theme.baseBackgroundL2.val,
              }}
              onClick={() => {
                const a = toDisplayBalance(maxAmount, token.decimals);
                setStrAmount(a);
                setAmount(maxAmount);
              }}
            >
              {t("max")}: {toDisplayBalance(maxAmount, token.decimals)}{" "}
              {token.ticker}
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
  signature?: string;
  isComplete: boolean;
  titleOverride?: string;
  onViewBalances?: () => void;
}) {
  const theme = useTheme();
  const drawer = useDrawerContext();
  const explorer = useBlockchainExplorer(blockchain);
  const connectionUrl = useBlockchainConnectionUrl(blockchain);
  const { t } = useTranslation();
  return (
    <div
      style={{
        height: "264px",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div style={{ display: "flex" }}>
        <div style={{ flex: 1 }} />
        <div style={{ display: "flex", marginTop: "30px" }}>
          <Typography
            style={{
              textAlign: "center",
              color: theme.baseTextMedEmphasis.val,
              fontSize: "14px",
              fontWeight: 500,
            }}
          >
            {titleOverride
              ? titleOverride
              : isComplete
              ? t("sent")
              : t("sending_dots")}
          </Typography>
          {isComplete ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                marginLeft: "8px",
              }}
            >
              <CheckIcon style={{ height: "16px", width: "16px" }} />
            </div>
          ) : null}
        </div>
        <div style={{ flex: 1 }} />
      </div>
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
        {!isComplete ? (
          <Loading
            size={48}
            iconStyle={{
              color: theme.baseTextHighEmphasis.val,
              display: "flex",
              marginLeft: "auto",
              marginRight: "auto",
            }}
          />
        ) : null}
      </div>
      <div
        style={{
          marginBottom: "16px",
          marginLeft: "16px",
          marginRight: "16px",
        }}
      >
        {signature && explorer && connectionUrl && isComplete ? (
          <PrimaryButton
            onClick={async () => {
              drawer.close();
              if (onViewBalances) onViewBalances();
            }}
            label={t("view_balances")}
            style={{
              marginBottom: "8px",
            }}
          />
        ) : null}
        {signature && explorer && connectionUrl ? (
          <SecondaryButton
            onClick={async () => {
              window.open(explorerUrl(explorer, signature, connectionUrl));
            }}
            label={t("view_explorer")}
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
  const theme = useTheme();
  const { t } = useTranslation();

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
          overflow: "hidden",
        }}
      >
        <Typography
          style={{
            marginBottom: "16px",
            color: theme.baseTextHighEmphasis.val,
          }}
        >
          {t("error")}
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
            color: theme.baseTextHighEmphasis.val,
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
            label={t("view_explorer")}
            onClick={() =>
              window.open(
                explorerUrl(explorer, signature, connectionUrl),
                "_blank"
              )
            }
          />
        ) : null}
      </div>
      <PrimaryButton label={t("retry")} onClick={() => onRetry()} />
    </div>
  );
}
