import { useEffect, useState } from "react";
import { Box } from "@mui/material";
import { PublicKey } from "@solana/web3.js";
import Transport from "@ledgerhq/hw-transport";
import TransportWebHid from "@ledgerhq/hw-transport-webhid";
import * as anchor from "@project-serum/anchor";
import * as ledgerCore from "@coral-xyz/ledger-core";
import { useAnchorContext, useEphemeralNav } from "@coral-xyz/recoil";
import { Header, PrimaryButton, SubtextParagraph } from "../../common";
import { HardwareWalletIcon } from "./";
import { ImportAccounts } from "../../Account/ImportAccounts";
import { ConnectFailureHardware } from "./ConnectFailureHardware";
import {
  getBackgroundClient,
  DerivationPath,
  EXTENSION_WIDTH,
  EXTENSION_HEIGHT,
  UI_RPC_METHOD_LEDGER_IMPORT,
} from "@coral-xyz/common";

type DeviceState = "detecting" | "found" | "none";

let transport: Transport | null = null;

export function SearchingHardware() {
  const [deviceState, setDeviceState] = useState<DeviceState>("detecting");
  const [navigatorStateChange, setNavigatorStateChange] = useState(0);
  const { connection } = useAnchorContext();
  const [transport, setTransport] = useState<Transport | null>(null);
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

  const nav = useEphemeralNav();
  //
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
      // @ts-ignore
      const devices = await navigator.hid.getDevices();
      if (devices.length > 0) {
        if (transport === null) {
          TransportWebHid.create().then(setTransport);
        }
        setDeviceState("found");
      } else {
        console.log("none");
        setDeviceState("none");
      }
    })();
  }, [navigatorStateChange]);

  useEffect(() => {
    (async () => {
      if (deviceState !== "found" || !transport) return;

      const combinedPubkeys: Array<PublicKey> = [];

      // Bip44.
      for (let k = 0; k < 11; k += 1) {
        const p = await ledgerCore.getPublicKey(
          transport,
          k,
          DerivationPath.Bip44
        );
        combinedPubkeys.push(p);
      }

      // Bip44Change.
      for (let k = 0; k < 10; k += 1) {
        const p = await ledgerCore.getPublicKey(
          transport,
          k,
          DerivationPath.Bip44Change
        );
        combinedPubkeys.push(p);
      }

      const combinedAccounts = (
        await anchor.utils.rpc.getMultipleAccounts(connection, combinedPubkeys)
      ).map((result, idx) =>
        result === null ? { publicKey: combinedPubkeys[idx] } : result
      );

      const bip44Root = combinedAccounts.slice(0, 1);
      const bip44 = combinedAccounts.slice(1, 11);
      const bip44Change = combinedAccounts.slice(11);

      setDerivationAccounts({
        bip44Root,
        bip44,
        bip44Change,
      });
    })();
  }, [deviceState, transport]);

  const next = () => {
    if (deviceState === "none") {
      nav.push(<ConnectFailureHardware />);
    } else {
      nav
        .push
        // <ImportAccounts publicKeys={derivationAccounts} onNext={() => {}} />
        ();
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        justifyContent: "space-between",
      }}
    >
      <Box
        sx={{
          marginTop: "16px",
          marginLeft: "24px",
          marginRight: "24px",
        }}
      >
        <HardwareWalletIcon />
        <Header text="Searching for wallet..." />
        <SubtextParagraph>
          Make sure your wallet is connected, unlocked and browser permissions
          are approved.
        </SubtextParagraph>
      </Box>
      <Box
        sx={{
          marginLeft: "16px",
          marginRight: "16px",
          marginBottom: "16px",
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <PrimaryButton
          label="Next"
          onClick={next}
          disabled={deviceState === "detecting"}
        />
      </Box>
    </Box>
  );
}
