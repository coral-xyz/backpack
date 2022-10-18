import { DomProvider } from "./Context";
import { WithTheme } from "./WithTheme";
import { useEffect, useState } from "react";
import { Event } from "@coral-xyz/common-public";
import { Element } from "react-xnft";
import { RootRenderer } from "./Renderer";
const DEFAULT_METADATA = {
  isDarkMode: false,
};

export const App = () => {
  //@ts-ignore
  const dom: any = window.dom;
  const [metadata, setMetadata] = useState(DEFAULT_METADATA);

  useEffect(() => {
    window.addEventListener("load", () => {
      // @ts-ignore
      window.xnft.on("metadata", (event: Event) => {
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
