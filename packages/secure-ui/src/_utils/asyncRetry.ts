const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export function retry<T>(
  retries: number,
  fn: () => Promise<T>,
  onError?: (e: Error) => void
): [Promise<T>, () => Promise<void>] {
  let resolveCancel: (result?: void) => void;
  const cancelPromise = new Promise<void>((_resolve, _reject) => {
    resolveCancel = _resolve;
  });
  let cancel = () => cancelPromise;
  const result = new Promise<T>(async (resolve, reject) => {
    let retry = 0;
    cancel = () => {
      retry = Infinity;
      return cancelPromise.then(() => {
        reject(new Error("Cancelled (retry)"));
      });
    };
    const error = (e) => {
      onError?.(e);
      retry++;
      if (retry === retries) {
        return reject(new Error("Too many retries."));
      }
    };
    while (retry < retries) {
      try {
        await fn()
          .then((result) => {
            retry = retries; // stop retries
            resolve(result);
          })
          .catch(error);
      } catch (e) {
        error(e);
      }
      await delay(1000);
    }
    resolveCancel();
  });

  return [result, cancel];
}
