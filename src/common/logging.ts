export function log(str: any, ...args: any) {
  console.log(`anchor: ${str}`, ...args);
}

export function debug(str: any, ...args: any) {
  log(str, ...args);
}

export function error(str: any, ...args: any) {
  console.error(`anchor: ${str}`, ...args);
}
