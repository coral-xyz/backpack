import { useEffect, useState } from "react";
import { Element } from "react-xnft";
import { Component } from "./Component";

export function ViewRenderer({ element }: { element: Element }) {
  const [viewData, setViewData] = useState<Element>(element);

  //
  // Reload state on props change.
  //
  useEffect(() => {
    setViewData(element);
  }, [element]);

  return <Component viewData={viewData} />;
}
