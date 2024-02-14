export const delay = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export function retry<T>(
  retries: number,
  fn: () => Promise<T>,
  onError: (e: Error) => Promise<boolean> = async () => true
): [Promise<T>, (e: Error) => Promise<void>] {
  let rejectRetry: (result?: Error) => void;
  let retry = 0;

  const cancel = async (e: Error) => {
    retry = Infinity;
    rejectRetry(e);
  };

  const result = new Promise<T>(async (resolve, reject) => {
    rejectRetry = reject;

    const error = async (e) => {
      if (retry === Infinity) {
        return;
      }
      try {
        // if onError returns true -> continue
        if (await onError(e)) {
          if (retry === Infinity) {
            return;
          }
          retry++;
          if (retry >= retries) {
            return reject(new Error("Too many retries."));
          }
        }
        // if onError returns false -> abort
        else {
          retry = Infinity;
        }
      } catch (e) {
        console.error(e);
        // if onError check fails -> abort
        return reject(new Error("Unknown onError"));
      }
    };
    while (retry < retries) {
      await fn()
        .then((result) => {
          retry = Infinity; // stop retries
          resolve(result);
        })
        .catch(error);

      // were not done -> delay before next cycle
      if (retry < retries) {
        await delay(1000);
      }
    }
  });

  return [result, cancel];
}
