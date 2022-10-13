import { DomProvider } from "./Context";
import { RootRenderer } from "./Renderer";
import { WithTheme } from "./WithTheme";

export const App = () => {
  //@ts-ignore
  const dom: any = window.dom;
  return (
    <DomProvider dom={dom}>
      <WithTheme>
        <RootRenderer />
      </WithTheme>
    </DomProvider>
  );
};
