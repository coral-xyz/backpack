import { useEffect, useState } from "react";
import { Box } from "@mui/material";
import Transport from "@ledgerhq/hw-transport";
import TransportWebHid from "@ledgerhq/hw-transport-webhid";
import { Blockchain } from "@coral-xyz/common";
import {
  Header,
  HeaderIcon,
  PrimaryButton,
  SubtextParagraph,
} from "../../../../common";
import { HardwareWalletIcon } from "../../../../common/Icon";
import { ConnectHardwareFailure } from "./ConnectHardwareFailure";
import { ConnectHardwareApp } from "./ConnectHardwareApp";

export function ConnectHardwareSearching({
  blockchain,
  onNext,
  isConnectFailure = false,
}: {
  blockchain: Blockchain;
  onNext: (transport: Transport) => void;
  isConnectFailure?: boolean;
}) {
  const [transport, setTransport] = useState<Transport | null>(null);
  const [navigatorStateChange, setNavigatorStateChange] = useState(0);
  const [connectFailure, setConnectFailure] = useState(isConnectFailure);
  const [connectSuccess, setConnectSuccess] = useState(false);

  //
  // When devices get connected or disconnected, we need to refresh.
  //
  useEffect(() => {
    // @ts-ignore
    const connectListener = navigator.hid.addEventListener("connect", () => {
      setNavigatorStateChange((prev) => prev + 1);
    });
    // @ts-ignore
    const disconnectListener = navigator.hid.addEventListener(
      "disconnect",
      async () => {
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
      if (transport === null && !connectFailure) {
        TransportWebHid.create()
          .then(setTransport)
          .catch(async (err) => {
            if (err.message === "The device is already open.") {
              const devices = await TransportWebHid.list();
              // Close all open devices
              await Promise.all(devices.map((d) => d.close()));
              // Reload
              setNavigatorStateChange(() => navigatorStateChange + 1);
            } else if (err.message === "Access denied to use Ledger device") {
              // User cancelled the permissions screen, or no device available in screen
              setTimeout(() => setConnectFailure(true), 2000);
            } else {
              console.error(err);
              setTimeout(() => setConnectFailure(true), 2000);
            }
          });
      }
    })();
  }, [connectFailure, navigatorStateChange]);

  useEffect(() => {
    // Auto advance is transport set
    if (transport) {
      setTimeout(() => setConnectSuccess(true), 2000);
    }
  }, [transport]);

  if (connectFailure) {
    return <ConnectHardwareFailure onRetry={() => setConnectFailure(false)} />;
  } else if (connectSuccess) {
    // Got device, but relevant app is not necessarily open. Remind user to open.
    return (
      <ConnectHardwareApp
        blockchain={blockchain}
        onNext={() => onNext(transport!)}
      />
    );
  }

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        justifyContent: "space-between",
      }}
    >
      <Box sx={{ margin: "0 24px" }}>
        <HeaderIcon icon={<HardwareWalletIcon />} />
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
        {/*
        This is just a placeholder next button so its always disabled. Screen
        will auto advance when transport is set.
        */}
        <PrimaryButton label="Next" disabled={true} />
      </Box>
    </Box>
  );
}
