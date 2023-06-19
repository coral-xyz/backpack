import { useEffect, useState } from "react";
import { UserClient } from "@coral-xyz/secure-background/clients";
import type {
  SECURE_EVENTS,
  SecureRequest,
  TransportReceiver,
  TransportResponder,
  TransportSender,
} from "@coral-xyz/secure-background/types";
import {
  config as tamaguiConfig,
  PrimaryButton,
  SecondaryButton,
  Sheet,
  Stack,
  TamaguiProvider,
  Text,
  TwoButtonFooter,
} from "@coral-xyz/tamagui";
import { decode } from "bs58";
import { RecoilRoot } from "recoil";

import {
  secureBackgroundSenderAtom,
  secureUIReceiverAtom,
} from "./_atoms/transportAtoms";
import { ApproveTransactionBottomSheet } from "./ApproveTransactionBottomSheet";

export function SecureUI({
  secureUIReceiver,
  secureBackgroundSender,
}: {
  secureUIReceiver: TransportReceiver<SECURE_EVENTS, "confirmation">;
  secureBackgroundSender: TransportSender<SECURE_EVENTS>;
}) {
  const [open, setOpen] = useState<{
    event: TransportResponder<SECURE_EVENTS, "confirmation">;
    resolve: (resonse: any) => void;
  } | null>(null);

  useEffect(() => {
    const user = new UserClient(secureBackgroundSender, {
      context: "extension",
      address: "EXTENSION",
      name: "Backpack",
    });

    secureUIReceiver.setHandler(async (event) => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      let resolve;
      const promise = new Promise<any>((_resolve) => {
        resolve = _resolve;
      });

      const resolver = async (
        response: Parameters<typeof event.respond>[0]
      ) => {
        const unlockResponse = await user.unlockKeyring({
          uuid: "uuid",
          password: "password",
        });
        console.log("PCA unlock response", unlockResponse);
        setOpen(null);
        resolve(event.respond(response));
      };
      console.log("event received");
      setOpen({
        event,
        resolve: resolver,
      });

      return promise;
    });
  }, [secureUIReceiver, secureBackgroundSender]);

  //@ts-ignore
  const msgBuffer = Buffer.from(decode(open?.event?.request?.message ?? ""));
  const message = msgBuffer.toString();

  // if popup was opened for a confirmation -> how fullscreen;
  const DefaultPresentation = window.location.href.includes("windowId=")
    ? FullscreenPresentation
    : ModalPresentation;

  // eslint-disable-next-line no-constant-condition
  if (true) return null;

  return (
    <RecoilRoot
      initializeState={({ set }) => {
        set(secureBackgroundSenderAtom, secureBackgroundSender);
        set(secureUIReceiverAtom, secureUIReceiver);
      }}
    >
      <TamaguiProvider config={tamaguiConfig}>
        <Stack
          zIndex={10}
          position="absolute"
          top="0px"
          left="0px"
          height="100%"
          width="100%"
          pointerEvents="none"
          outlineColor="red"
          outlineOffset="$-1"
        >
          <DefaultPresentation
            open={!!open}
            setOpen={(isOpen) => {
              if (!isOpen) open?.resolve({ confirmed: false });
            }}
          >
            <ApproveTransactionBottomSheet
              message={message}
              onApprove={() => open?.resolve({ confirmed: true })}
              onDeny={() => open?.resolve({ confirmed: false })}
            />
          </DefaultPresentation>
        </Stack>
      </TamaguiProvider>
    </RecoilRoot>
  );
}

function FullscreenPresentation({
  open,
  children,
}: {
  children: React.ReactElement;
  open: boolean;
  setOpen: (open: boolean) => void;
}) {
  if (!open) {
    return null;
  }
  return (
    <Stack
      position="absolute"
      height="100%"
      width="100%"
      display="flex"
      justifyContent="center"
      alignContent="center"
      backgroundColor="$background"
      pointerEvents="auto"
    >
      {children}
    </Stack>
  );
}

function ModalPresentation({
  open,
  children,
  setOpen,
}: {
  children: React.ReactElement;
  open: boolean;
  setOpen: (open: boolean) => void;
}) {
  const [position, setPosition] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setIsOpen(true);
  }, []);

  const render = open && isOpen;
  return (
    <Sheet
      forceRemoveScrollEnabled
      open={render}
      modal
      onOpenChange={setOpen}
      dismissOnSnapToBottom={false}
      position={position}
      onPositionChange={setPosition}
      zIndex={100_000}
      animation="bouncy"
    >
      <Sheet.Overlay backgroundColor="rgba(0,0,0,0.3)" />
      <Sheet.Handle />
      <Sheet.Frame>{render ? children : null}</Sheet.Frame>
    </Sheet>
  );
}
