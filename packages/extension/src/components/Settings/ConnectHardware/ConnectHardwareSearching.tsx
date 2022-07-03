import { useEffect, useState } from "react";
import { Box } from "@mui/material";
import Transport from "@ledgerhq/hw-transport";
import TransportWebHid from "@ledgerhq/hw-transport-webhid";
import { Header, PrimaryButton, SubtextParagraph } from "../../common";
import { HardwareWalletIcon } from "../../Icon";
import { ConnectHardwareFailure } from "./ConnectHardwareFailure";
import { ConnectHardwareApp } from "./ConnectHardwareApp";

type DeviceState = "detecting" | "found" | "none";

export function ConnectHardwareSearching({
  onNext,
  isConnectFailure = false,
}: {
  onNext: (transport: Transport) => void;
  isConnectFailure?: boolean;
}) {
  const [deviceState, setDeviceState] = useState<DeviceState>("detecting");
  const [transport, setTransport] = useState<Transport | null>(null);
  const [navigatorStateChange, setNavigatorStateChange] = useState(0);
  const [connectFailure, setConnectFailure] = useState(isConnectFailure);
  const [connectSuccess, setConnectSuccess] = useState(false);

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
          TransportWebHid.create()
            .then(setTransport)
            .catch(async (err) => {
              if (err.message === "The device is already open.") {
                const devices = await TransportWebHid.list();
                await Promise.all(devices.map((d) => d.close()));
                setNavigatorStateChange(() => navigatorStateChange + 1);
              }
            });
        }
      } else {
        // No HID devices
        setTimeout(() => setConnectFailure(true), 2000);
      }
    })();
  }, [connectFailure, navigatorStateChange]);

  useEffect(() => {
    if (transport) {
      setTimeout(() => setConnectSuccess(true), 2000);
    }
  }, [transport]);

  if (connectFailure) {
    return <ConnectHardwareFailure onRetry={() => setConnectFailure(false)} />;
  } else if (connectSuccess) {
    // Got device, but app is not necessarily open. Remind user to open.
    return <ConnectHardwareApp onNext={() => onNext(transport!)} />;
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
      <Box
        sx={{
          marginTop: "16px",
          marginLeft: "24px",
          marginRight: "24px",
        }}
      >
        <Box sx={{ display: "block", textAlign: "center", mb: "12px" }}>
          <HardwareWalletIcon />
        </Box>
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
        {/* This is just a placeholdern next button so its always disabled */}
        <PrimaryButton label="Next" disabled={true} />
      </Box>
    </Box>
  );
}
