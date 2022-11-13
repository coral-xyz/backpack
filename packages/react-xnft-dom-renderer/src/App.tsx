import { DomProvider } from "./Context";
import { WithTheme } from "./WithTheme";
import { useEffect, useState } from "react";
import { Event, XnftMetadata } from "@coral-xyz/common";
import { RootRenderer } from "./Renderer";

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
