const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function retry<T>(
  fn: () => Promise<T>,
  retries: number
): Promise<T> {
  return new Promise<T>(async (resolve, reject) => {
    let retry = 0;

    while (retry < retries) {
      await fn()
        .then((result) => {
          retry = retries;
          resolve(result);
        })
        .catch((e) => {
          console.log(e);
          retry++;
          if (retry === retries) {
            reject("Too many retries.");
          }
        });
      await delay(1000);
    }
  });
}
