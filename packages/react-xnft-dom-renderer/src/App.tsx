import { DomProvider } from "./Context";
import { WithTheme } from "./WithTheme";
import { useEffect, useState } from "react";
import { Event } from "@coral-xyz/common-public";
import { RootRenderer } from "./Renderer";
import { XnftMetadata } from "@coral-xyz/common";

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
