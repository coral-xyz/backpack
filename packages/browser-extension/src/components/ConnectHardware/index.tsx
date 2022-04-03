import { useState, useEffect } from "react";
import {
  useTheme,
  makeStyles,
  Select,
  MenuItem,
  Typography,
  CircularProgress,
} from "@material-ui/core";
import { PublicKey } from "@solana/web3.js";
import Transport from "@ledgerhq/hw-transport";
import TransportWebHid from "@ledgerhq/hw-transport-webhid";
import * as anchor from "@project-serum/anchor";
import { useAnchorContext } from "../../hooks/useWallet";
import { Stepper, WithContinue } from "../Onboarding/CreateNewWallet";
import {
  EXTENSION_WIDTH,
  EXTENSION_HEIGHT,
  UI_RPC_METHOD_LEDGER_IMPORT,
} from "../../common";
import * as crypto from "../../keyring/crypto";
import * as ledgerCore from "../../keyring/ledger-core";
import { getBackgroundClient } from "../../background/client";

const STEP_COUNT = 3;
let TRANSPORT: Transport | null = null;

const useStyles = makeStyles((theme: any) => ({
  menuPubkey: {
    fontWeight: 500,
    color: theme.custom.colors.fontColor,
  },
  menuAmount: {
    color: theme.custom.colors.secondary,
  },
  menuPaper: {
    fontWeight: 500,
    color: theme.custom.colors.fontColor,
    background: theme.custom.colors.background,
  },
}));

export function ConnectHardware() {
  const theme = useTheme() as any;
  const [activeStep, setActiveState] = useState(0);
  const handleNext = () => {
    setActiveState(activeStep + 1);
  };
  const handleBack = () => {
    setActiveState(activeStep - 1);
  };
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        height: "100vh",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          marginLeft: "auto",
          marginRight: "auto",
          width: EXTENSION_WIDTH,
          height: EXTENSION_HEIGHT,
          backgroundColor: theme.custom.colors.background,
        }}
      >
        <div style={{ height: "56px" }}>
          <Stepper
            activeStep={activeStep}
            handleBack={handleBack}
            stepCount={STEP_COUNT}
          />
        </div>
        <div style={{ flex: 1 }}>
          {activeStep === 0 && <Step0 next={handleNext} />}
          {activeStep === 1 && <Step1 next={handleNext} />}
          {activeStep === 2 && <Step2 />}
        </div>
      </div>
    </div>
  );
}

type DeviceState = "detecting" | "found" | "none";

function Step0({ next }: any) {
  const [deviceState, setDeviceState] = useState<DeviceState>("detecting");
  const [navigatorStateChange, setNavigatorStateChange] = useState(0);

  //
  // When devices get connected or disconnected, we need to refresh.
  //
  useEffect(() => {
    // @ts-ignore
    const connectListener = navigator.hid.addEventListener(
      "connect",
      (event: any) => {
        setNavigatorStateChange((prev) => prev + 1);
      }
    );
    // @ts-ignore
    const disconnectListener = navigator.hid.addEventListener(
      "disconnect",
      async (event: any) => {
        setNavigatorStateChange((prev) => prev + 1);
      }
    );
    return () => {
      // @ts-ignore
      navigator.hid.removeEventListener("connect", connectListener);
      // @ts-ignore
      navigator.hid.removeEventListener("disconnect", disconnectListener);
    };
  }, []);

  //
  // Check how many connected devices we actually have.
  //
  useEffect(() => {
    (async () => {
      setDeviceState("detecting");
      // @ts-ignore
      const devices = await navigator.hid.getDevices();
      console.log("devices", devices);
      if (devices.length > 0) {
        setDeviceState("found");
      } else {
        setDeviceState("none");
      }
    })();
  }, [navigatorStateChange]);
  const _next = async () => {
    if (TRANSPORT === null) {
      TransportWebHid.create().then(async (transport) => {
        TRANSPORT = transport;
        next();
      });
    } else {
      next();
    }
  };

  return (
    <WithContinue next={_next} canContinue={deviceState === "found"}>
      <div style={{ textAlign: "center" }}>
        {deviceState === "detecting"
          ? "Detecting device."
          : deviceState === "none"
          ? "Open the Solana app. Please connect your hardware wallet and make sure it's unlocked."
          : "Device found."}
      </div>
    </WithContinue>
  );
}

function Step1({ next }: any) {
  const { connection } = useAnchorContext();
  const [derivationAccounts, setDerivationAccounts] = useState<any>(null);
  const [pathType, setPathType] = useState("root");
  const [pathIndex, setPathIndex] = useState(0);
  const onPathTypeChange = (e: any) => {
    setPathType(e.target.value);
    setPathIndex(0);
  };
  const onPathIndexChange = (e: any) => {
    setPathIndex(e.target.value);
  };

  const addAccount = async () => {
    //
    // TODO: share this with the "DerivationPath" type in common/crypto.ts.
    //
    const dPath =
      pathType === "root" || pathType === "bip44" ? "bip44" : "bip44-change";

    const accountPubkey =
      pathType === "root"
        ? derivationAccounts.bip44Root[0]
        : pathType === "bip44"
        ? derivationAccounts.bip44[pathIndex]
        : derivationAccounts.bip44Change[pathIndex];

    //
    // Note that the backend treats root and bip44 as the same derivation path,
    // even though the UI doesn't. So we need to shift pathIndex by 1.
    //
    const account =
      pathType === "root"
        ? 0
        : pathType === "bip44"
        ? pathIndex + 1
        : pathIndex;
    const background = getBackgroundClient();
    await background.request({
      method: UI_RPC_METHOD_LEDGER_IMPORT,
      params: [dPath, account, accountPubkey.publicKey.toString()],
    });

    next();
  };

  useEffect(() => {
    (async () => {
      const combinedPubkeys: Array<PublicKey> = [];

      // Bip44.
      for (let k = 0; k < 11; k += 1) {
        const p = await ledgerCore.getPublicKey(
          TRANSPORT!,
          k,
          crypto.DerivationPath.Bip44
        );
        combinedPubkeys.push(p);
      }

      // Bip44Change.
      for (let k = 0; k < 10; k += 1) {
        const p = await ledgerCore.getPublicKey(
          TRANSPORT!,
          k,
          crypto.DerivationPath.Bip44Change
        );
        combinedPubkeys.push(p);
      }

      const combinedAccounts = (
        await anchor.utils.rpc.getMultipleAccounts(connection, combinedPubkeys)
      ).map((result, idx) =>
        result === null ? { publicKey: combinedPubkeys[idx] } : result
      );

      const bip44Root = combinedAccounts.slice(0, 1);
      const bip44 = combinedAccounts.slice(0, 11);
      const bip44Change = combinedAccounts.slice(11);

      setDerivationAccounts({
        bip44Root,
        bip44,
        bip44Change,
      });
    })();
  }, []);

  return (
    <WithContinue
      next={addAccount}
      canContinue={true}
      buttonLabel={"Add Account"}
    >
      <Typography>Select wallet address</Typography>
      {derivationAccounts === null ? (
        <CircularProgress />
      ) : (
        <DerivationSelection
          derivationAccounts={derivationAccounts}
          pathType={pathType}
          setPathType={setPathType}
          pathIndex={pathIndex}
          setPathIndex={setPathIndex}
          onPathTypeChange={onPathTypeChange}
          onpathIndexChange={onPathIndexChange}
        />
      )}
    </WithContinue>
  );
}

function DerivationSelection({
  derivationAccounts,
  pathType,
  setPathType,
  pathIndex,
  setPathIndex,
  onPathTypeChange,
  onPathIndexChange,
}: any) {
  const classes = useStyles();

  const accounts =
    pathType === "root"
      ? derivationAccounts.bip44Root
      : pathType === "bip44"
      ? derivationAccounts.bip44
      : derivationAccounts.bip44Change;

  return (
    <>
      <Select
        value={pathType}
        onChange={onPathTypeChange}
        MenuProps={{
          classes: {
            paper: classes.menuPaper,
          },
        }}
      >
        <MenuItem value={"root"}>
          <Typography className={classes.menuPubkey}>44'/501'</Typography>
        </MenuItem>
        <MenuItem value={"bip44"}>
          <Typography className={classes.menuPubkey}>44'/501'/0'</Typography>
        </MenuItem>
        <MenuItem value={"bip44-change"}>
          <Typography className={classes.menuPubkey}>44'/501'/0'/0'</Typography>
        </MenuItem>
      </Select>
      <Select
        value={pathIndex}
        onChange={onPathIndexChange}
        MenuProps={{
          classes: {
            paper: classes.menuPaper,
          },
        }}
      >
        {accounts.map(({ publicKey, account }: any, idx: number) => {
          return (
            <MenuItem key={idx} value={idx}>
              <div
                style={{
                  width: "100%",
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <Typography
                  className={classes.menuPubkey}
                >{`${publicKey.toString()}`}</Typography>
                <Typography className={classes.menuAmount}>
                  {account ? account.lamports / 10 ** 9 : 0}
                </Typography>
              </div>
            </MenuItem>
          );
        })}
      </Select>
    </>
  );
}

function Step2() {
  const complete = () => {
    window.close();
  };
  return (
    <WithContinue canContinue={true} buttonLabel={"Done"} next={complete}>
      <Typography>All Done!</Typography>
    </WithContinue>
  );
}
