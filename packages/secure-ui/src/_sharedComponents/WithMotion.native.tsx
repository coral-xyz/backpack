export function WithMotion({
  children,
}: {
  inactive?: boolean;
  children: React.ReactNode;
  id: string | number;
}) {
  return <>{children}</>;
}
