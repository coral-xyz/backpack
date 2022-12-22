import { useEffect, useState } from "react";
import type { Event, XnftMetadata } from "@coral-xyz/common";

import { DomProvider } from "./Context";
import { RootRenderer } from "./Renderer";
import { WithTheme } from "./WithTheme";

const DEFAULT_METADATA: XnftMetadata = {
  isDarkMode: false,
  username: "",
  photo: "",
};

export const App = () => {
  //@ts-ignore
  const dom: any = window.dom;
  const [metadata, setMetadata] = useState(DEFAULT_METADATA);

  useEffect(() => {
    window.addEventListener("load", () => {
      // @ts-ignore
      window.xnft.addListener("metadata", (event: Event) => {
        setMetadata(event.data.metadata);
      });
    });
  }, []);

  return (
    <DomProvider dom={dom} metadata={metadata}>
      <WithTheme>
        <RootRenderer />
      </WithTheme>
    </DomProvider>
  );
};
