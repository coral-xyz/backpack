import { useEffect, useState } from "react";
import type { SECURE_LEDGER_EVENTS } from "@coral-xyz/secure-background/types";
import { Spinner, Stack, StyledText } from "@coral-xyz/tamagui";
// import Ethereum from "@ledgerhq/hw-app-eth";
import Solana from "@ledgerhq/hw-app-solana";
// import type Transport from "@ledgerhq/hw-transport";
import TransportWebHid from "@ledgerhq/hw-transport-webhid";
import { ethers } from "ethers";

const { base58 } = ethers.utils;

import type { QueuedRequest } from "../_atoms/clientAtoms";
import { retry } from "../_utils/asyncRetry";
import { RequireUserUnlocked } from "../Guards/RequireUserUnlocked";
import { Presentation } from "../Presentation";

type RequestHandlers<T extends SECURE_LEDGER_EVENTS> = Record<
  T,
  (request: QueuedRequest<T>, setStatus: (status: string) => void) => void
>;

export function LedgerSignRequest({
  currentRequest,
}: {
  currentRequest: QueuedRequest<SECURE_LEDGER_EVENTS>;
}) {
  return (
    <Presentation
      currentRequest={currentRequest}
      onClosed={() => currentRequest.error("Plugin Closed")}
    >
      {(currentRequest) => (
        <RequireUserUnlocked>
          <ApproveOnLedger currentRequest={currentRequest} />
        </RequireUserUnlocked>
      )}
    </Presentation>
  );
}

function ApproveOnLedger({
  currentRequest,
}: {
  currentRequest: QueuedRequest<SECURE_LEDGER_EVENTS>;
}) {
  const [status, setStatus] = useState("Approve on your Ledger");
  useEffect(() => {
    const handlers: RequestHandlers<SECURE_LEDGER_EVENTS> = {
      LEDGER_SVM_SIGN_TX: svmSignTx,
      LEDGER_SVM_SIGN_MESSAGE: svmSignMessage,
      LEDGER_EVM_SIGN_TX: evmSignTx,
      LEDGER_EVM_SIGN_MESSAGE: evmSignMessage,
    };

    const handler = handlers[currentRequest.name];
    return handler && handler(currentRequest, setStatus);
  }, [currentRequest]);

  return (
    <Stack>
      <Spinner size="large" color="$accentBlue" />
      <StyledText
        textAlign="center"
        marginTop="$8"
        fontSize="$6xl"
        color="$baseTextHighEmphasis"
      >
        {status}
      </StyledText>
    </Stack>
  );
}

async function svmSignTx(
  currentRequest: QueuedRequest<"LEDGER_SVM_SIGN_TX">,
  setStatus: (status: string) => void
) {
  setStatus("Unlock Ledger and Open Solana App!");

  retry(() => TransportWebHid.create(), 100)
    .then((transport) => {
      const solana = new Solana(transport);

      setStatus("Sign Transaction on Ledger!");

      return retry(
        () =>
          solana.signTransaction(
            currentRequest.request.derivationPath,
            Buffer.from(base58.decode(currentRequest.request.txMessage))
          ),
        100
      );
    })
    .then((result) => {
      currentRequest.respond({
        signature: base58.encode(result.signature),
      });
    })
    .catch((e) => {
      // console.log(e);
      currentRequest.error(JSON.stringify(e));
    });
}

async function svmSignMessage(
  currentRequest: QueuedRequest<"LEDGER_SVM_SIGN_MESSAGE">,
  setStatus: (status: string) => void
) {
  setStatus("Unlock Ledger and open Solana App");

  retry(() => TransportWebHid.create(), 100)
    .then((transport) => {
      const solana = new Solana(transport);

      setStatus("Sign Message on Ledger");

      return retry(
        () =>
          solana.signOffchainMessage(
            currentRequest.request.derivationPath,
            Buffer.from(base58.decode(currentRequest.request.message))
          ),
        100
      );
    })
    .then((result) => {
      currentRequest.respond({
        signature: base58.encode(result.signature),
      });
    })
    .catch((e) => {
      // console.log(e);
      currentRequest.error(JSON.stringify(e));
    });
}

async function evmSignTx(
  currentRequest: QueuedRequest<"LEDGER_EVM_SIGN_TX">,
  setStatus: (status: string) => void
) {}
async function evmSignMessage(
  currentRequest: QueuedRequest<"LEDGER_EVM_SIGN_MESSAGE">,
  setStatus: (status: string) => void
) {}
