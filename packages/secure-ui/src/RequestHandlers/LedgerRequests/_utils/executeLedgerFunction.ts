import type Transport from "@ledgerhq/hw-transport";

import { delay, retry } from "../../../_utils/asyncRetry";

const RETRY_IGNORED_ERROR = "Cancelled (retry)";

export function executeLedgerFunction<R, T extends Transport>(
  createTransport: () => Promise<T>,
  fx: (
    transport: T,
    setProgress: (progress: number) => void
  ) => () => Promise<R>,
  _onStep: (step: number, progress?: number) => void
): [
  Promise<R>, // result
  (e: Error) => void, // cancel / reject
] {
  let responded = false;
  let resolve: (result: R) => void, reject: (e: Error) => void;
  const response = new Promise<R>((_resolve, _reject) => {
    resolve = (r) => {
      responded = true;
      _resolve(r);
    };
    reject = (e) => {
      responded = true;
      _reject(e);
    };
  });
  const onStep = (step: number, progress?: number) => {
    if (!responded) {
      _onStep(step, progress);
    }
  };

  sign();
  return [response, (e: Error) => reject(e)];

  function sign(count: number = 0) {
    if (responded) {
      return;
    }
    let connectionTimeout;
    let statusTimeout;

    let HID_PERMISSIONS_NOT_AVAILABLE_count = 0;
    // try establishing connection to ledger device
    const [connectionResult, cancelConnection] = retry(
      100,
      () => createTransport(),
      async (e) => {
        // console.error(count, e, e.name, e.message);

        // set timeout because sometimes we just need to reconnect
        // so no need to update the status.
        // The probability of seeing this before gesture required is low.
        connectionTimeout = setTimeout(
          () => onStep(0), // requires ledger connection
          3000
        );

        const isError = isLedgerError(e?.message);
        if (isError("HID_PERMISSIONS_NOT_AVAILABLE")) {
          // It's not uncommon to get one / two permissions error before successful connect.
          // so we just count the errors and act on them after the gesture timer ran out.
          HID_PERMISSIONS_NOT_AVAILABLE_count++;
        }
        if (isError("HID_GESTURE_REQUIRED")) {
          // Once we get a HID_GESTURE_REQUIRED error, there is no recovering anymore.
          // It's on a timer after the last gesture.

          // If we got HID_PERMISSIONS_NOT_AVAILABLE errors
          // before the gesture timer ran out we assume missing permissions.
          if (HID_PERMISSIONS_NOT_AVAILABLE_count > 0) {
            reject(new Error("HID_PERMISSIONS_NOT_AVAILABLE"));
          }
          // without permissions error we just prompt the user to retry aka perform a gesture.
          else {
            reject(new Error("HID_GESTURE_REQUIRED"));
          }
          return false;
        }

        return !responded; // only continue/retry if not responded already
      }
    );

    // cleanup if promise is cancelled early (ie Popup closed)
    response
      .finally(async () => {
        cancelConnection(new Error(RETRY_IGNORED_ERROR));
      })
      .catch(() => {});

    // wait for transport to be available
    connectionResult
      .then((transport) => {
        clearTimeout(connectionTimeout);

        let progressTimeout;
        // try executing ledger function:
        const [signatureResult, cancelSignature] = retry(
          200,
          fx(transport, (_progress: number) => {
            clearTimeout(statusTimeout);
            clearTimeout(connectionTimeout);
            clearTimeout(progressTimeout);
            onStep(3, _progress);
            progressTimeout = setTimeout(() => {
              cancel();
            }, 1500);
          }),
          async (error) => {
            // error -> not waiting for signature;
            clearTimeout(statusTimeout);

            const isError = isLedgerError(error?.message);

            console.error(count, error, error.name, error.message);
            if (isError("DENIED_BY_THE_USER")) {
              reject(new Error("User Denied Approval"));
            }
            // progress steps depending on error type
            else if (
              error.name.includes("LockedDeviceError") ||
              isError("DEVICE_IS_LOCKED")
            ) {
              onStep(1); // requires unlock device
            } else if (
              isError(
                "NO_OR_UNKOWN_APP",
                "APP_NOT_LAUNCHED_AT_THE_CORRECT_TIME",
                "IN_WRONG_APP_OR_NO_APPS_OPEN",
                "INPUT_NOT_SUPPORTD_WRONG_APP",
                "CLA_NOT_SUPPORTED"
              )
            ) {
              onStep(2); // requires app
            } else if (error.message.includes("blind signature")) {
              onStep(4); // requires blind signature
            } else if (count < 100) {
              onStep(0);
              await cancel();
              await delay(1000);
              sign(count + 1);
            } else {
              // after multiple failures: reject.
              reject(new Error("Ledger disconnected."));
            }

            // if there is no error in a while -> waiting for signature
            statusTimeout = setTimeout(() => {
              // if there is no Progress for a while:
              onStep(3);
            }, 1500);

            return !responded; // only continue/retry if not responded already
          }
        );

        // if there is no error in a while -> waiting for signature
        statusTimeout = setTimeout(() => {
          // if there is no Progress for a while:
          onStep(3);
        }, 1500);

        const cancel = async () => {
          try {
            clearTimeout(statusTimeout);
            clearTimeout(connectionTimeout);
            clearTimeout(progressTimeout);
            cancelSignature(new Error(RETRY_IGNORED_ERROR));
            cancelConnection(new Error(RETRY_IGNORED_ERROR));
            await retry(20, () => transport.close());
          } catch (e) {
            // console.error("cancel", e);
          }
        };
        transport.on("disconnect", async () => {
          await cancel();
          sign(count + 1);
        });

        // cleanup if promise is cancelled early (ie Popup closed)
        response
          .finally(async () => {
            try {
              cancelSignature(new Error(RETRY_IGNORED_ERROR));
              await retry(20, () => transport.close());
            } catch (e) {}
          })
          .catch(() => {});

        // wait to resolve promise with results
        signatureResult
          .then((result) => {
            resolve(result);
            cancel();
          })
          .catch((e) => {
            // console.error("signatureResult", e);
            if (e.message.includes(RETRY_IGNORED_ERROR)) {
              return;
            }
            reject(e);
          });
      })
      .catch((e) => {
        // console.error("connectionResult", e);
        if (e.message.includes(RETRY_IGNORED_ERROR)) {
          return;
        }
        reject(e);
      });
  }
}

const LedgerError = {
  HID_PERMISSIONS_NOT_AVAILABLE: "Access denied to use Ledger device",
  HID_GESTURE_REQUIRED: "Failed to execute 'requestDevice' on 'HID'",
  DOM_INVALID_STATE: "The device was closed unexpectedly.",
  // https://support.ledger.com/hc/en-us/articles/4407690578321-Solving-Error-0x6a83-or-0x6811-
  APP_DEPENDENCY_ISSUE: "0x6A83",
  APP_DEPENDENCY_ISSUE_ALT: "0x6A811",
  // https://support.ledger.com/hc/en-us/articles/5282886278557-Solve-error-0x6E01
  APP_NOT_LAUNCHED_AT_THE_CORRECT_TIME: "0x6E01",
  // https://github.com/ethers-io/ethers.js/discussions/1462
  DENIED_BY_THE_USER: "0x6985",
  // https://support.ledger.com/hc/en-us/articles/7632595533469-Solving-UNKNOWN-ERROR-0x5515
  DEVICE_IS_LOCKED: "0x5515",
  // https://support.ledger.com/hc/en-us/articles/11188216671005-Solve-error-0x6b0c-
  DEVICE_POSSIBLY_DISCONNECTED_OR_LOCKED: "0x6B0C",
  NO_OR_UNKOWN_APP: "0x6D02",
  CLA_NOT_SUPPORTED: "0x6e00",
  INPUT_NOT_SUPPORTD_WRONG_APP: "0x6D00",
  // https://support.ledger.com/hc/en-us/articles/11190934937117-Solve-error-0x6511
  IN_WRONG_APP_OR_NO_APPS_OPEN: "0x6511",
  // https://support.ledger.com/hc/en-us/articles/360007709194-Solve-error-0x6b00
  OUTDATED_FIRMWARE: "0x6B00",
  // https://support.ledger.com/hc/en-us/articles/5390126989725-Solve-error-0x6e00
  OUTDATED_FIRMWARE_ALT: "0x6E00",
  // https://support.ledger.com/hc/en-us/articles/5131971882397-Solving-0x6a82-error
  USER_MUST_ENABLE_EXPERIMENTAL_FEATURES_IN_LEDGER_LIVE: "0x6A82",
} as const;

const isLedgerError =
  (message?: string) =>
  (...errors: (keyof typeof LedgerError)[]) =>
    errors.some((error) =>
      message?.toUpperCase().includes(LedgerError[error].toUpperCase())
    );
