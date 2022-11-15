export function RegisterNativeXnft(
  name: string,
  componentProvider: () => () => JSX.Element
) {
  window.RegisterXnft(name, componentProvider);
}
