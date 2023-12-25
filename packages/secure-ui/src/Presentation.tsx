import type { SECURE_EVENTS } from "@coral-xyz/secure-clients/types";

import type { ReactNode } from "react";
import { Suspense, useEffect, useState } from "react";

import { Sheet, Stack } from "@coral-xyz/tamagui";
import { useRecoilValueLoadable } from "recoil";

import {
  isCurrentRequestRespondedAtom,
  type QueuedUiRequest,
} from "./_atoms/requestAtoms";
import { Loading } from "./_sharedComponents/Loading";
import { WithMotion } from "./_sharedComponents/WithMotion";

export type PresentationTypes =
  | undefined
  | "modal"
  | "modal-relative"
  | "fullscreen";

export function Presentation<T extends SECURE_EVENTS = SECURE_EVENTS>({
  currentRequest,
  presentation,
  children,
}: {
  currentRequest: QueuedUiRequest<T> | null;
  presentation?: PresentationTypes;
  children: ReactNode;
}) {
  // rerender when currentRequest is set to responded = true;
  useRecoilValueLoadable(isCurrentRequestRespondedAtom).getValue();

  useEffect(() => {
    const listener = (e: KeyboardEvent) => {
      if (e.key === "Escape" || e.code === "Escape" || e.keyCode === 27) {
        currentRequest?.error(new Error("Approval Denied: Popup Closed."));
      }
    };
    window.addEventListener?.("keydown", listener);
    return () => {
      window.removeEventListener("keydown", listener);
    };
  }, [currentRequest]);

  // if  popup was opened for a confirmation -> show fullscreen;
  // this is web-only so its ok
  // eslint-disable-next-line
  const DefaultPresentation = window.location?.href?.includes("windowId=")
    ? FullscreenPresentation
    : ModalPresentation;

  const Present = presentation?.includes("modal")
    ? ModalPresentation
    : presentation === "fullscreen"
    ? FullscreenPresentation
    : DefaultPresentation;

  return (
    <Present
      currentRequest={currentRequest}
      modal={!presentation?.includes("relative")}
    >
      <Suspense fallback={<Loading />}>
        {currentRequest ? children : <Loading delay={500} />}
      </Suspense>
    </Present>
  );
}

function FullscreenPresentation<T extends SECURE_EVENTS = SECURE_EVENTS>({
  children,
  currentRequest,
}: {
  children: ReactNode;
  modal: boolean;
  currentRequest: QueuedUiRequest<T> | null;
}) {
  return (
    <Stack position="absolute" height={600} width="100%" zIndex={100_000}>
      <WithMotion
        inactive={currentRequest?.responded}
        id={currentRequest?.id ?? "loading"}
      >
        {children}
      </WithMotion>
    </Stack>
  );
}

function ModalPresentation<T extends SECURE_EVENTS = SECURE_EVENTS>({
  currentRequest,
  modal,
  children,
}: {
  modal: boolean;
  children: ReactNode;
  currentRequest: QueuedUiRequest<T> | null;
}) {
  const [closedRequests, setClosedRequests] = useState<{
    [key: string | number]: boolean;
  }>({});

  // close sheet when currentRequest has been responed to.
  const isSheetOpen = !!currentRequest && !closedRequests[currentRequest.id];

  useEffect(() => {
    let effectCanceled = false;
    currentRequest?.addAfterResponseHandler(async () => {
      setTimeout(() => {
        if (effectCanceled) {
          return;
        }
        setClosedRequests((responded) => {
          if (responded[currentRequest.id]) {
            return responded;
          }
          return {
            ...responded,
            [currentRequest.id]: true,
          };
        });
      }, 100);
    });
    return () => {
      effectCanceled = true;
    };
  }, [currentRequest]);

  return (
    <Sheet
      open={isSheetOpen}
      modal={modal}
      snapPoints={[80]}
      dismissOnOverlayPress={false}
      dismissOnSnapToBottom={false}
      position={0}
      zIndex={101_000}
      animation="quick"
    >
      <Sheet.Overlay
        bc="$baseBackgroundL1"
        opacity={0.4}
        onPress={() => {
          currentRequest?.error(new Error("Approval Denied: Popup Closed."));
        }}
      />
      {/* <Sheet.Handle /> */}
      <Sheet.Frame bc="$baseBackgroundL0">
        <WithMotion
          inactive={currentRequest?.responded}
          id={currentRequest?.id ?? "loading"}
        >
          {children}
        </WithMotion>
      </Sheet.Frame>
    </Sheet>
  );
}
