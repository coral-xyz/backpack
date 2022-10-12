import { DomProvider } from "./Context";
import { RootRenderer } from "./Renderer";

export const App = () => {
  //@ts-ignore
  const dom: any = window.dom;
  return (
    <DomProvider dom={dom}>
      <RootRenderer />
    </DomProvider>
  );
};
