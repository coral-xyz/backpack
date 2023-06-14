import { useEffect } from "react";
import { UserClient } from "@coral-xyz/secure-background/clients";
import type {
  SECURE_EVENTS,
  TransportReceiver,
  TransportSender,
} from "@coral-xyz/secure-background/types";
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
  useEffect(() => {
    const user = new UserClient(secureBackgroundSender, {
      address: "EXTENSION",
      name: "Backpack",
    });

    secureUIReceiver.setHandler(async (request) => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const response = await user.unlockKeyring({
        uuid: "uuid",
        password: "password",
      });
      console.log("PCA unlock response", response);
      return {
        ...request,
        request: undefined,
        response: { confirmed: true },
      };
    });
  }, [secureUIReceiver, secureBackgroundSender]);

  return (
    <RecoilRoot
      initializeState={({ set }) => {
        set(secureBackgroundSenderAtom, secureBackgroundSender);
        set(secureUIReceiverAtom, secureUIReceiver);
      }}
    >
      null;
    </RecoilRoot>
  );
}
