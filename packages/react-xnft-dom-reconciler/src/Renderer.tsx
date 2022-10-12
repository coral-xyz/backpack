import { useEffect, useState } from "react";
import { Element } from "react-xnft";
import { ViewRenderer } from "./ViewRenderer";
import { useDomContext } from "./Context";

export function RootRenderer() {
  const { dom } = useDomContext();
  const [children, setChildren] = useState<Array<Element>>([]);
  console.log(children);
  //
  // Rerender when needed.
  //
  useEffect(() => {
    dom.onRenderRoot((c: Array<Element>) => {
      console.log("inside seecond one");
      console.log(c);
      setChildren([...c]);
    });
  }, [dom, setChildren]);

  return (
    <>
      <div>hi there</div>
      {children.map((e) => (
        <ViewRenderer key={e.id} element={e} />
      ))}
    </>
  );
}
