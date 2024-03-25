/**
 * Checks if the given path is a valid Trezor path conforming to
 * [this firmware spec](https://github.com/vacuumlabs/trezor-firmware/blob/5ec9326f52fa4a6b15c0e38f81bfd6f9dbd0b475/core/src/apps/solana/__init__.py#L3-L7)
 *
 * @param path - The path to check
 * @returns boolean indicating validity
 */
export function isLegalTrezorPath(path: string) {
  const pathRegex = /^m\/44'\/501'(\/\d'){0,2}$/;
  return pathRegex.test(path);
}
