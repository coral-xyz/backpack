import { useMemo, Suspense } from "react";
import * as bs58 from "bs58";
import { Transaction, Message } from "@solana/web3.js";
import {
  getBackgroundClient,
  useNavigation,
  useTransactionRequest,
  useAllPlugins,
  useActiveWallet,
} from "@200ms/recoil";
import {
  CHANNEL_PLUGIN_EXTENSION_NOTIFICATION_RESPONSE,
  PLUGIN_OUT_RESPONSE_NOTIFICATION_SHOW_TRANSACTION_APPROVAL,
  UI_RPC_METHOD_SIGN_TRANSACTION,
  UI_RPC_METHOD_SIGN_AND_SEND_TRANSACTION,
} from "@200ms/common";
import {
  makeStyles,
  useTheme,
  Typography,
  IconButton,
} from "@material-ui/core";
import { ArrowBack } from "@material-ui/icons";
import { Scrollbar } from "./Scrollbar";
import { walletAddressDisplay, Loading } from "../common";
import { WithTabs } from "./Tab";
import { Router } from "./Router";
import { WithMiniDrawer } from "./Drawer";
import { BottomCard } from "../Unlocked/Balances/Send";

export const NAV_BAR_HEIGHT = 56;
export const NAV_BUTTON_WIDTH = 38;

const useStyles = makeStyles((theme: any) => ({
  withNavContainer: {
    display: "flex",
    flexDirection: "column",
    height: "100%",
  },
  navBarContainer: {
    display: "flex",
    justifyContent: "space-between",
    paddingLeft: "16px",
    paddingRight: "16px",
    paddingTop: "10px",
    paddingBottom: "10px",
  },
  menuButtonContainer: {
    width: `${NAV_BUTTON_WIDTH}px`,
    display: "flex",
    justifyContent: "center",
    flexDirection: "column",
    position: "relative",
  },
  overviewLabel: {
    fontSize: "18px",
    fontWeight: 500,
    lineHeight: "24px",
    color: theme.custom.colors.fontColor,
  },
  overviewLabelPrefix: {
    color: theme.custom.colors.secondary,
  },
  backButton: {
    padding: 0,
    "&:hover": {
      background: "transparent",
    },
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
}));

// The main nav persistent stack.
export function TabNavStack() {
  const classes = useStyles();
  return (
    <WithTabs>
      <div className={classes.withNavContainer}>
        <NavBar />
        <NavContent />
        <ApproveTransactionRequest />
      </div>
    </WithTabs>
  );
}

function ApproveTransactionRequest() {
  const [request, setRequest] = useTransactionRequest();
  const plugins = useAllPlugins();
  const { publicKey } = useActiveWallet();
  const plugin = request
    ? plugins.find((p) => p.iframeUrl === request.pluginUrl)
    : undefined;

  // TODO: this check shouldn't be necessary.
  if (request && publicKey.toString() !== request.publicKey) {
    throw new Error("invariant violation");
  }

  const onConfirm = async () => {
    if (!request) {
      throw new Error("request not found");
    }
    const background = getBackgroundClient();

    let signature;
    if (request!.kind === "sign-tx") {
      signature = await background.request({
        method: UI_RPC_METHOD_SIGN_TRANSACTION,
        params: [request.data, publicKey.toString()],
      });
    } else {
      signature = await background.request({
        method: UI_RPC_METHOD_SIGN_AND_SEND_TRANSACTION,
        params: [request.data, publicKey.toString()],
      });
    }

    sendTransactionApprovalResponse(request, signature);
    setRequest(undefined);
  };

  const onReject = async () => {
    sendTransactionApprovalResponse(request, null);
    setRequest(undefined);
  };

  return (
    <WithMiniDrawer
      openDrawer={request !== undefined}
      setOpenDrawer={(open: boolean) => {
        if (!open) {
          setRequest(undefined);
        }
      }}
    >
      <BottomCard
        onButtonClick={onConfirm}
        buttonLabel={"Confirm"}
        cancelButton={true}
        onReject={onReject}
      >
        {request && (
          <div style={{ padding: "24px", height: "100%" }}>
            <Scrollbar>
              {request?.kind === "sign-tx" ? (
                <SignTransaction transaction={request?.data} plugin={plugin} />
              ) : request.kind === "sign-msg" ? (
                <SignMessage message={request?.data} plugin={plugin} />
              ) : (
                <SignAndSendTransaction
                  transaction={request?.data}
                  plugin={plugin}
                />
              )}
            </Scrollbar>
          </div>
        )}
      </BottomCard>
    </WithMiniDrawer>
  );
}

function SignTransaction({ transaction, plugin }: any) {
  const theme = useTheme() as any;
  const classes = useStyles();
  const deserializedTx = useMemo(() => {
    if (!transaction) {
      return undefined;
    }
    return Transaction.populate(Message.from(bs58.decode(transaction!)));
  }, [transaction]);

  return (
    <>
      <Typography
        style={{
          color: theme.custom.colors.fontColor,
          fontWeight: 500,
          fontSize: "18px",
          lineHeight: "24px",
        }}
      >
        Confirm Transaction
      </Typography>
      <div
        style={{
          marginTop: "18px",
        }}
      >
        {plugin && (
          <div className={classes.confirmRow}>
            <Typography className={classes.confirmRowLabelLeft}>
              xNFT
            </Typography>
            <Typography className={classes.confirmRowLabelRight}>
              {plugin.iframeUrl}
            </Typography>
          </div>
        )}
        <div className={classes.confirmRow}>
          <Typography className={classes.confirmRowLabelLeft}>
            Network
          </Typography>
          <Typography className={classes.confirmRowLabelRight}>
            Solana
          </Typography>
        </div>
        <div className={classes.confirmRow}>
          <Typography className={classes.confirmRowLabelLeft}>
            Network Fee
          </Typography>
          <Typography className={classes.confirmRowLabelRight}>
            - SOL
          </Typography>
        </div>
        <div className={classes.confirmRow}>
          <Typography className={classes.confirmRowLabelLeft}>
            Sending from
          </Typography>
          <Typography className={classes.confirmRowLabelRight}>
            {walletAddressDisplay(deserializedTx!.feePayer!)}
          </Typography>
        </div>
        <Typography
          className={classes.confirmRowLabelRight}
          style={{
            wordBreak: "break-all",
          }}
        >
          {transaction}
        </Typography>
      </div>
    </>
  );
}

function SignMessage({ message }: any) {
  // todo
  return <></>;
}

function SignAndSendTransaction({ transaction }: any) {
  // todo
  return <></>;
}

function NavBar() {
  return (
    <Suspense fallback={<div></div>}>
      <_NavBar />
    </Suspense>
  );
}

function _NavBar() {
  const classes = useStyles();
  const theme = useTheme() as any;
  const { isRoot } = useNavigation();
  return (
    <div
      style={{
        borderBottom: !isRoot
          ? `solid 1pt ${theme.custom.colors.border}`
          : undefined,
        height: `${NAV_BAR_HEIGHT}px`,
      }}
      className={classes.navBarContainer}
    >
      <LeftNavButton />
      <CenterDisplay />
      <RightNavButton />
    </div>
  );
}

function LeftNavButton() {
  const { isRoot } = useNavigation();
  return isRoot ? <DummyButton /> : <NavBackButton />;
}

function RightNavButton() {
  const { navButtonRight } = useNavigation();
  return navButtonRight ? navButtonRight : <DummyButton />;
}

export function NavBackButton() {
  const { pop } = useNavigation();
  return <_NavBackButton pop={pop} />;
}

export function _NavBackButton({ pop }: any) {
  const classes = useStyles();
  const theme = useTheme() as any;
  return (
    <div style={{ display: "flex", width: `${NAV_BUTTON_WIDTH}px` }}>
      <IconButton
        disableRipple
        onClick={() => pop()}
        className={classes.backButton}
      >
        <ArrowBack style={{ color: theme.custom.colors.secondary }} />
      </IconButton>
    </div>
  );
}

function NavContent() {
  return (
    <div style={{ flex: 1 }}>
      <Scrollbar>
        <Suspense fallback={<Loading />}>
          <Router />
        </Suspense>
      </Scrollbar>
    </div>
  );
}

function CenterDisplay() {
  return (
    <Suspense fallback={<div></div>}>
      <_CenterDisplay />
    </Suspense>
  );
}

function _CenterDisplay() {
  const { title, isRoot } = useNavigation();
  return <__CenterDisplay title={title} isRoot={isRoot} />;
}

export function __CenterDisplay({ title, isRoot }: any) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        flexDirection: "column",
        visibility: isRoot ? "hidden" : undefined,
      }}
    >
      <NavTitleLabel title={title} />
    </div>
  );
}

export function NavTitleLabel({ title }: any) {
  const classes = useStyles();
  const titleComponents = title.split("/");
  return titleComponents.length === 2 ? (
    <Typography className={classes.overviewLabel}>
      <span className={classes.overviewLabelPrefix}>
        {titleComponents[0]} /
      </span>
      {titleComponents[1]}
    </Typography>
  ) : (
    <Typography className={classes.overviewLabel}>{title}</Typography>
  );
}

export function DummyButton() {
  const classes = useStyles();
  return <div className={classes.menuButtonContainer}></div>;
}

function sendTransactionApprovalResponse(
  request: any,
  signature: string | null
) {
  const event = {
    type: CHANNEL_PLUGIN_EXTENSION_NOTIFICATION_RESPONSE,
    detail: {
      name: PLUGIN_OUT_RESPONSE_NOTIFICATION_SHOW_TRANSACTION_APPROVAL,
      data: {
        request,
        signature,
      },
    },
  };
  window.postMessage(event, "*");
}
