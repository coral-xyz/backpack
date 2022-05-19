function log(str: any, ...args: any) {
  console.log(`anchor: ${str}`, ...args);
}

function debug(str: any, ...args: any) {
  log(str, ...args);
}

function error(str: any, ...args: any) {
  console.error(`${str}`, ...args);
}

export function getLogger(mod: string) {
  return (() => {
    const _mod = mod;
    return {
      debug: (str: string, ...args: any) => debug(`${_mod}: ${str}`, ...args),
      error: (str: string, ...args: any) => error(`${_mod}: ${str}`, ...args),
    };
  })();
}
