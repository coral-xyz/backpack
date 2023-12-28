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
      100,
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

        // try executing ledger function:
        const [signatureResult, cancelSignature] = retry(
          100,
          fx(transport, (progress: number) => {
            onStep(3, progress);
          }),
          async (error) => {
            // error -> not waiting for signature;
            clearTimeout(timeout);

            console.error(error, error.name, error.message);
            if (error?.message?.includes("0x6985")) {
              reject(new Error("User Denied Approval"));
            }
            // progress steps depending on error type
            else if (error.name.includes("LockedDeviceError")) {
              onStep(1); // requires unlock device
            } else if (error.message.includes("UNKNOWN_APDU")) {
              onStep(2); // requires app
            } else if (error.message.includes("blind signature")) {
              onStep(4); // requires app
            } else if (count < 100) {
              try {
                await cancelSignature();
                await cancelConnection();
                await retry(20, () => transport.close());
              } catch (e) {
                console.error(e);
              }
              sign(count + 1);
            } else {
              // after multiple failures: reject.
              reject(new Error("Ledger disconnected."));
            }

            // if there is no error in a while -> waiting for signature
            timeout = setTimeout(() => {
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
