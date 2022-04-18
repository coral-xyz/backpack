export function log(str: any, ...args: any) {
  console.log(`anchor: ${str}`, ...args);
}

export function debug(str: any, ...args: any) {
  log(str, ...args);
}

export function error(str: any, ...args: any) {
  console.error(`${str}`, ...args);
}

export function getLogger(mod: string) {
  return (() => {
    const _mod = mod;
    return {
      log: (str: string, ...args: any) =>
        console.log(`${_mod}: ${str}`, ...args),
      debug: (str: string, ...args: any) => debug(`${_mod}: ${str}`, ...args),
      error: (str: string, ...args: any) => error(`${_mod}: ${str}`, ...args),
    };
  })();
}
