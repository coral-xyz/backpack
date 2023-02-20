export function maybeRender(
  condition: boolean,
  fn: () => JSX.Element
): JSX.Element | null {
  if (condition) {
    return fn() as JSX.Element;
  }

  return null;
}
