import { type ReactNode } from "react";
/**
 * Empty wrapper so we don't include react-native code in the web build
 */
export default function SecureUIBottomSheetModalProvider({
  children,
}: {
  children: ReactNode;
}) {
  return <>{children}</>;
}
