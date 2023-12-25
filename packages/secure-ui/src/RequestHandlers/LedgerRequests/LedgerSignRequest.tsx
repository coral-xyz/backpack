import type { QueuedUiRequest } from "../../_atoms/requestAtoms";
import type { SECURE_LEDGER_EVENTS } from "@coral-xyz/secure-clients/types";
import type Transport from "@ledgerhq/hw-transport";

import { useEffect, useState } from "react";

import {
  Loader,
  Stack,
  StyledText,
  Spinner,
  HardwareIcon,
} from "@coral-xyz/tamagui";
import Ethereum from "@ledgerhq/hw-app-eth";
import Solana from "@ledgerhq/hw-app-solana";
import TransportWebHid from "@ledgerhq/hw-transport-webhid";
import { decode, encode } from "bs58";
import { Signature, Transaction } from "ethers6";

import { executeLedgerFunction } from "./_utils/executeLedgerFunction";
import { RequireUserUnlocked } from "../../RequireUserUnlocked/RequireUserUnlocked";
import { RequestHeader } from "../../_sharedComponents/RequestHeader";

type RequestHandlers<Events extends SECURE_LEDGER_EVENTS> = {
  [Event in Events]: (
    currentRequest: QueuedUiRequest<Event>,
    setStatus: (status: string) => void
  ) => Promise<void>;
};

export type LedgerSignEvents =
  | "LEDGER_SVM_SIGN_TX"
  | "LEDGER_SVM_SIGN_MESSAGE"
  | "LEDGER_EVM_SIGN_TX"
  | "LEDGER_EVM_SIGN_MESSAGE";

export function LedgerSignRequest({
  currentRequest,
}: {
  currentRequest: QueuedUiRequest<LedgerSignEvents>;
}) {
  return (
    <RequireUserUnlocked
      onReset={() => currentRequest.error(new Error("Login Failed"))}
    >
      <ApproveOnLedger currentRequest={currentRequest} />
    </RequireUserUnlocked>
  );
}

function ApproveOnLedger({
  currentRequest,
}: {
  currentRequest: QueuedUiRequest<LedgerSignEvents>;
}) {
  const [status, setStatus] = useState(
    "Approve Signature on your Ledger device."
  );
  useEffect(() => {
    (async function () {
      const handlers: RequestHandlers<LedgerSignEvents> = {
        LEDGER_SVM_SIGN_TX: svmSignTx,
        LEDGER_SVM_SIGN_MESSAGE: svmSignMessage,
        LEDGER_EVM_SIGN_TX: evmSignTx,
        LEDGER_EVM_SIGN_MESSAGE: evmSignMessage,
      };

      const handler = handlers[currentRequest.name];
      // TODO: replace :any
      await handler?.(currentRequest as any, setStatus);
    })();
  }, [currentRequest.id]);

  return (
    <Stack h="100%" justifyContent="center" alignItems="center">
      <RequestHeader>Approve on your Ledger device</RequestHeader>
      <Stack margin="$4">
        <HardwareIcon height={64} width={64} />
      </Stack>
      <Loader />
      <StyledText
        textAlign="center"
        margin="$4"
        marginTop="$6"
        color="$baseTextHighEmphasis"
      >
        {status}
      </StyledText>
    </Stack>
  );
}

async function svmSignTx(
  currentRequest: QueuedUiRequest<"LEDGER_SVM_SIGN_TX">,
  setStatus: (status: string) => void
) {
  // try executing ledger function
  const [result, cancel] = executeLedgerFunction(
    () => TransportWebHid.create(),
    (transport) => () => {
      const solana = new Solana(transport as any);
      return solana.signTransaction(
        currentRequest.request.derivationPath,
        Buffer.from(decode(currentRequest.request.txMessage))
      );
    },
    (step) => {
      const status = [
        "Connect your Ledger device",
        "Unlock your Ledger device",
        "Open the Solana App on your Ledger device.",
        "Approve Transaction on your Ledger device.",
        "Enable Blind Signature",
      ];
      setStatus(status[step]);
    }
  );

  // cancel/cleanup ledger connection if popup is closed
  currentRequest.addBeforeResponseHandler(async () =>
    cancel(new Error("Plugin Closed"))
  );

  // wait for result
  result
    .then((result) => {
      currentRequest.respond({
        signature: encode(result.signature),
      });
    })
    .catch((e) => {
      // console.log(e);
      currentRequest.error(e instanceof Error ? e : new Error(e));
    });
}

async function svmSignMessage(
  currentRequest: QueuedUiRequest<"LEDGER_SVM_SIGN_MESSAGE">,
  setStatus: (status: string) => void
) {
  // try executing ledger function
  const [result, cancel] = executeLedgerFunction(
    () => TransportWebHid.create(),
    (transport) => () => {
      const solana = new Solana(transport as any);
      return solana.signOffchainMessage(
        currentRequest.request.derivationPath,
        Buffer.from(decode(currentRequest.request.message))
      );
    },
    (step) => {
      const status = [
        "Connect your Ledger device",
        "Unlock your Ledger device",
        "Open the Solana App on your Ledger device.",
        "Approve Signature on your Ledger device.",
        "Enable Blind Signature",
      ];
      setStatus(status[step]);
    }
  );

  // cancel/cleanup ledger connection if popup is closed
  currentRequest.addBeforeResponseHandler(async () =>
    cancel(new Error("Plugin Closed"))
  );

  // wait for result
  result
    .then((result) => {
      currentRequest.respond({
        signature: encode(result.signature),
      });
    })
    .catch((e) => {
      // console.log(e);
      currentRequest.error(e instanceof Error ? e : new Error(e));
    });
}

async function evmSignTx(
  currentRequest: QueuedUiRequest<"LEDGER_EVM_SIGN_TX">,
  setStatus: (status: string) => void
) {
  // try executing ledger function
  const [result, cancel] = executeLedgerFunction(
    () => TransportWebHid.create(),
    (transport) => () => {
      const ethereum = new Ethereum(transport as any);
      return ethereum.signTransaction(
        currentRequest.request.derivationPath,
        currentRequest.request.txHex.substring(2)
      );
    },
    (step) => {
      const status = [
        "Connect your Ledger device",
        "Unlock your Ledger device",
        "Open the Ethereum App on your Ledger device.",
        "Approve Transaction on your Ledger device.",
        "Enable Blind Signature",
      ];
      setStatus(status[step]);
    }
  );

  // cancel/cleanup ledger connection if popup is closed
  currentRequest.addBeforeResponseHandler(async () =>
    cancel(new Error("Plugin Closed"))
  );

  // wait for result
  result
    .then((result) => {
      const transaction = Transaction.from(currentRequest.request.txHex);
      transaction.signature = {
        r: "0x" + result.r,
        s: "0x" + result.s,
        v: parseInt(result.v),
      };
      currentRequest.respond({
        signedTxHex: transaction.serialized,
      });
    })
    .catch((e) => {
      // console.log(e);
      currentRequest.error(e instanceof Error ? e : new Error(e));
    });
}
async function evmSignMessage(
  currentRequest: QueuedUiRequest<"LEDGER_EVM_SIGN_MESSAGE">,
  setStatus: (status: string) => void
) {
  // try executing ledger function
  const [result, cancel] = executeLedgerFunction(
    () => TransportWebHid.create(),
    (transport) => () => {
      const ethereum = new Ethereum(transport as any);
      return ethereum.signPersonalMessage(
        currentRequest.request.derivationPath,
        Buffer.from(decode(currentRequest.request.message58)).toString("hex")
      );
    },
    (step) => {
      const status = [
        "Connect your Ledger device",
        "Unlock your Ledger device",
        "Open the Ethereum App on your Ledger device.",
        "Approve Signature on your Ledger device.",
        "Enable Blind Signature",
      ];
      setStatus(status[step] ?? "");
    }
  );

  // cancel/cleanup ledger connection if popup is closed
  currentRequest.addBeforeResponseHandler(async () =>
    cancel(new Error("Plugin Closed"))
  );

  // wait for result
  result
    .then((result) => {
      currentRequest.respond({
        signatureHex: Signature.from({
          r: "0x" + result.r,
          s: "0x" + result.s,
          v: result.v,
        }).serialized,
      });
    })
    .catch((e) => {
      // console.log(e);
      currentRequest.error(e instanceof Error ? e : new Error(e));
    });
}
