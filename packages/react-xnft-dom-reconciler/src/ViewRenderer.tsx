import { useEffect, useState } from "react";
import { Element } from "react-xnft";
import { Component } from "./Component";
import { useDomContext } from "./Context";

export function ViewRenderer({ element }: { element: Element }) {
  const { dom } = useDomContext();
  const [viewData, setViewData] = useState<Element>(element);

  //
  // Reload state on props change.
  //
  useEffect(() => {
    setViewData(element);
  }, [element]);

  //
  // Rerender when needed.
  //
  useEffect(() => {
    dom.onRender(viewData.id, (newViewData: Element) => {
      setViewData({
        ...newViewData,
      });
    });
  }, [dom, setViewData]);

  return <Component viewData={viewData} />;
}
