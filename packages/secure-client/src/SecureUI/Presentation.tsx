import { useEffect, useState } from "react";
import { Sheet, Stack, Theme } from "@coral-xyz/tamagui";
import { useRecoilValue } from "recoil";

import type { QueuedRequest } from "./_atoms/clientAtoms";
import { userAtom } from "./_atoms/userAtom";

export function Presentation({
  currentRequest,
  presentation,
  children,
}: {
  currentRequest: QueuedRequest;
  presentation?: "modal" | "fullscreen";
  children: React.ReactElement;
}) {
  const currentUser = useRecoilValue(userAtom);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(!!currentRequest);
  }, [currentRequest]);

  if (!currentUser) {
    return null;
  }

  // // if popup was opened for a confirmation -> show fullscreen;
  const DefaultPresentation = window.location.href.includes("windowId=")
    ? FullscreenPresentation
    : ModalPresentation;

  const Present =
    presentation === "modal"
      ? ModalPresentation
      : presentation === "fullscreen"
      ? FullscreenPresentation
      : DefaultPresentation;

  return (
    <Theme name={currentUser.user?.preferences.darkMode ? "dark" : "light"}>
      <Stack
        zIndex={10}
        position="absolute"
        top="0px"
        left="0px"
        height="100%"
        width="100%"
        pointerEvents="box-none"
        outlineColor="red"
        outlineOffset="$-1"
      >
        <Present
          open={!!open}
          setOpen={(isOpen) => {
            if (!isOpen) currentRequest.respond({ confirmed: false });
          }}
        >
          {children}
        </Present>
      </Stack>
    </Theme>
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
    // this effect is to force the sheet from rendering before animating
    // prevents bug where animations comes in from top.
    setIsOpen(true);
  }, []);

  const render = open && isOpen;
  return (
    <Sheet
      forceRemoveScrollEnabled
      open={render}
      modal={false}
      onOpenChange={setOpen}
      dismissOnSnapToBottom={false}
      position={position}
      onPositionChange={setPosition}
      zIndex={100_000}
      animation="bouncy"
    >
      <Sheet.Overlay backgroundColor="rgba(0,0,0,0.3)" />
      {/* <Sheet.Handle /> */}
      <Sheet.Frame>{render ? children : null}</Sheet.Frame>
    </Sheet>
  );
}
