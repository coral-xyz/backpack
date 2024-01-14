import type Transport from "@ledgerhq/hw-transport";

import { retry } from "../../../_utils/asyncRetry";

export function executeLedgerFunction<R, T extends Transport>(
  createTransport: () => Promise<T>,
  fx: (
    transport: T,
    setProgress: (progress: number) => void
  ) => () => Promise<R>,
  onStep: (step: number, progress?: number) => void
): [
  Promise<R>, // result
  (e: Error) => void // cancel / reject
] {
  let resolve: (result: R) => void, reject: (e: Error) => void;
  const response = new Promise<R>((_resolve, _reject) => {
    resolve = _resolve;
    reject = _reject;
  });

  sign();
  return returns();

  // wrapped in a function to ensure reject is defined
  function returns(): [Promise<R>, (e: Error) => void] {
    return [response, reject];
  }

  function sign(count: number = 0) {
    let timeout;

    // try establishing connection to ledger device
    const [connectionResult, cancelConnection] = retry(
      200,
      () => createTransport(),
      async (e) => {
        console.error(e.name, e.message);

        onStep(0); // requires ledger connection
      }
    );

    // cleanup if promise is cancelled early (ie Popup closed)
    response.finally(async () => {
      await cancelConnection();
    });

    // wait for transport to be available
    connectionResult
      .then((transport) => {
        // cleanup if promise is canceled early (ie Popup closed)
        let progress: undefined | number;
        // try executing ledger function:
        const [signatureResult, cancelSignature] = retry(
          200,
          fx(transport, (_progress: number) => {
            progress = _progress;
            clearTimeout(timeout);
            onStep(3, _progress);
          }),
          async (error) => {
            // error -> not waiting for signature;
            clearTimeout(timeout);
            // clearTimeout(interval);

            const isError = isLedgerError(error?.message);
            const cancel = async () => {
              try {
                clearTimeout(timeout);
                await cancelSignature();
                await cancelConnection();
                await retry(20, () => transport.close());
              } catch (e) {
                console.error(e);
              }
            };
            console.error(error, error.name, error.message);
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
                "INPUT_NOT_SUPPORTD_WRONG_APP"
              )
            ) {
              onStep(2); // requires app
            } else if (error.message.includes("blind signature")) {
              onStep(4); // requires app
            } else if (count < 100) {
              onStep(0);
              await cancel();
              sign(count + 1);
            } else {
              // after multiple failures: reject.
              reject(new Error("Ledger disconnected."));
            }

            // if there is no error in a while -> waiting for signature
            timeout = setTimeout(() => {
              // if there is no Progress for a while:
              onStep(3);
            }, 1500);
          }
        );

        // transport.on("disconnect", async () => {
        //   await cancelSignature();
        //   await cancelConnection();
        //   await retry(20, () => transport.close());
        //   sign(count + 1);
        // });

        // cleanup if promise is cancelled early (ie Popup closed)
        response.finally(async () => {
          try {
            await cancelSignature();
            await retry(
              20,
              () => transport.close()
              // async (e) => {
              //   console.error(e.name, e.message);
              //   return true;
              // }
            );
          } catch (e) {
            console.error(e);
          }
        });
        // wait to resolve promise with results
        signatureResult.then(resolve).catch((e) => {
          if (!e.message.includes("Cancelled (retry)")) {
            reject(e);
          }
          console.error(e);
        });
      })
      .catch((e) => {
        if (!e.message.includes("Cancelled (retry)")) {
          reject(e);
        }
        console.error(e);
      });
  }
}

const LedgerError = {
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
