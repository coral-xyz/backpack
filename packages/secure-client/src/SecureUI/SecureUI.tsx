import { useEffect, useState } from "react";
import { UserClient } from "@coral-xyz/secure-background/clients";
import type {
  SECURE_EVENTS,
  SecureRequest,
  TransportReceiver,
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
import { RecoilRoot } from "recoil";

import {
  secureBackgroundSenderAtom,
  secureUIReceiverAtom,
} from "./_atoms/transportAtoms";

export function SecureUI({
  secureUIReceiver,
  secureBackgroundSender,
}: {
  secureUIReceiver: TransportReceiver<SECURE_EVENTS, "confirmation">;
  secureBackgroundSender: TransportSender<SECURE_EVENTS>;
}) {
  const [position, setPosition] = useState(0);
  const [open, setOpen] = useState<{
    request: SecureRequest<SECURE_EVENTS>;
    resolve: (resonse: any) => void;
  } | null>(null);

  useEffect(() => {
    const user = new UserClient(secureBackgroundSender, {
      address: "EXTENSION",
      name: "Backpack",
    });

    secureUIReceiver.setHandler(async (request) => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      let resolve;
      const promise = new Promise<any>((_resolve) => {
        resolve = _resolve;
      });

      const resolver = async (response: any) => {
        const unlockResponse = await user.unlockKeyring({
          uuid: "uuid",
          password: "password",
        });
        console.log("PCA unlock response", unlockResponse);
        setOpen(null);
        resolve(response);
      };

      setOpen({
        request,
        resolve: resolver,
      });

      return promise;
    });
  }, [secureUIReceiver, secureBackgroundSender]);

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
        >
          <Sheet
            forceRemoveScrollEnabled
            open={!!open}
            modal={false}
            dismissOnSnapToBottom={false}
            position={position}
            onPositionChange={setPosition}
            zIndex={100_000}
            animation="bouncy"
          >
            <Sheet.Overlay backgroundColor="rgba(0,0,0,0.3)" />
            <Sheet.Handle />
            <Sheet.Frame>
              <TwoButtonFooter
                leftButton={
                  <SecondaryButton
                    label="Deny"
                    onPress={() =>
                      open?.resolve({
                        name: open.request.name,
                        response: { confirmed: false },
                      })
                    }
                  />
                }
                rightButton={
                  <PrimaryButton
                    label="Approve"
                    onPress={() =>
                      open?.resolve({
                        name: open.request.name,
                        response: { confirmed: true },
                      })
                    }
                  />
                }
              />
            </Sheet.Frame>
          </Sheet>
        </Stack>
      </TamaguiProvider>
    </RecoilRoot>
  );
}
