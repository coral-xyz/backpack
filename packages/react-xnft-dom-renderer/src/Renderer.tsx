import { useEffect, useState } from "react";
import type { Element } from "react-xnft";
import { styles } from "@coral-xyz/themes";

import { useDomContext } from "./Context";
import { ViewRenderer } from "./ViewRenderer";
const useStyles = styles((theme) => {
  return {
    appContainer: {
      height: "100vh",
      width: "100%",
      background: theme.custom.colors.backgroundBackdrop,
      position: "absolute",
    },
  };
});
export function RootRenderer() {
  const { dom } = useDomContext();
  const [children, setChildren] = useState<Array<Element>>([]);
  const classes = useStyles();

  //
  // Rerender when needed.
  //
  useEffect(() => {
    dom.onRenderRoot((c: Array<Element>) => {
      setChildren([...c]);
    });
  }, [setChildren]);

  return (
    <>
      <div className={classes.appContainer}>
        {children.map((e) => (
          <ViewRenderer key={e.id} element={e} />
        ))}
      </div>
    </>
  );
}
