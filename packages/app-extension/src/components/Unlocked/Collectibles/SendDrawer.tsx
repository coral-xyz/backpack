export function SendDrawer({
  children,
  nft: _,
}: {
  children: (openDrawer: () => void) => React.ReactElement;
  nft: any;
}) {
  const send = () => {};
  return <>{children(send)}</>;
}
