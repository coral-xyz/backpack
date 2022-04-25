import { AnchorProvider } from "./Context";

export function AnchorDom({ children }: any) {
  return <AnchorProvider>{children}</AnchorProvider>;
}
