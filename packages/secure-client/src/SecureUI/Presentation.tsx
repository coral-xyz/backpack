import { useCallback, useEffect, useState } from "react";
import type {
  SECURE_EVENTS,
  SecureResponse,
} from "@coral-xyz/secure-background/types";
import { Sheet, Stack, Theme } from "@coral-xyz/tamagui";
import { useRecoilCallback, useRecoilValue } from "recoil";

import type { QueuedRequest } from "./_atoms/clientAtoms";
import { userAtom } from "./_atoms/userAtom";

export function Presentation<T extends SECURE_EVENTS = SECURE_EVENTS>({
  currentRequest,
  presentation,
  onClosed,
  children,
}: {
  currentRequest: QueuedRequest<T>;
  presentation?: "modal" | "fullscreen";
  onClosed: () => void;
  children: (request: QueuedRequest<T>) => React.ReactElement;
}) {
  const currentUser = useRecoilValue(userAtom);

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
    <Theme name={currentUser?.user?.preferences.darkMode ? "dark" : "light"}>
      <Stack
        zIndex={10}
        position="absolute"
        top="0px"
        left="0px"
        right="0px"
        bottom="0px"
        height="100%"
        width="100%"
        backgroundColor="rgba(0,0,0,0.5)"
      >
        <Present onClosed={onClosed} currentRequest={currentRequest}>
          {children}
        </Present>
      </Stack>
    </Theme>
  );
}

function FullscreenPresentation<T extends SECURE_EVENTS = SECURE_EVENTS>({
  currentRequest,
  children,
}: {
  children: (request: QueuedRequest<T>) => React.ReactElement;
  currentRequest: QueuedRequest<T>;
  onClosed: () => void;
}) {
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
      {children(currentRequest)}
    </Stack>
  );
}

function ModalPresentation<T extends SECURE_EVENTS = SECURE_EVENTS>({
  currentRequest,
  onClosed,
  children,
}: {
  children: (request: QueuedRequest<T>) => React.ReactElement;
  currentRequest: QueuedRequest<T>;
  onClosed: () => void;
}) {
  const [isOpen, setIsOpen] = useState<boolean | null>(null);

  // open sheet when currentRequest changes
  useEffect(() => {
    // On initial render, wait to force the sheet from rendering before animating
    // prevents bug where animations comes in from top.
    if (isOpen === null) {
      setTimeout(() => setIsOpen(true), 200);
    } else if (isOpen === false) {
      setIsOpen(true);
    }
    // if sheet already open - close then reopen
    else if (isOpen === true) {
      setIsOpen(false);
      setTimeout(() => setIsOpen(true), 200);
    }
  }, [currentRequest]);

  // Give Sheet time to animate out before sending response
  const respond = useCallback(
    (response: SecureResponse<T, "uiResponse">["response"]) => {
      setIsOpen(false);
      setTimeout(() => currentRequest.respond(response), 200);
    },
    [currentRequest]
  );

  // Give Sheet time to animate out before sending response
  const error = useCallback(
    (error) => {
      setIsOpen(false);
      setTimeout(() => currentRequest.error(error), 200);
    },
    [currentRequest]
  );

  if (!currentRequest) {
    return null;
  }

  return (
    <Sheet
      open={!!isOpen}
      modal
      onOpenChange={(open) => {
        if (!open) {
          onClosed();
        }
      }}
      snapPoints={[80]}
      dismissOnSnapToBottom={false}
      position={0}
      zIndex={100_000}
      animation="quick"
    >
      {/* <Sheet.Overlay backgroundColor="rgba(0,0,0,0.3)" /> */}
      {/* <Sheet.Handle /> */}
      <Sheet.Frame>
        {children({ ...currentRequest, respond, error })}
      </Sheet.Frame>
    </Sheet>
  );
}
