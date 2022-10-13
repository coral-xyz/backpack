import { useEffect, useState } from "react";
import { Element } from "react-xnft";
import { ViewRenderer } from "./ViewRenderer";
import { useDomContext } from "./Context";
import { styles } from "@coral-xyz/themes";
const useStyles = styles((theme) => {
  return {
    appContainer: {
      height: "100vh",
      width: "100%",
      background: theme.custom.colors.backgroundBackdrop,
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
    console.log(
      "added setChildren onRenderROotonRenderROotonRenderROotonRenderROotonRenderROotonRenderROotonRenderROotonRenderROotonRenderROotonRenderROotonRenderROotonRenderROotonRenderROotonRenderROotonRenderROotonRenderROotonRenderROotonRenderROotonRenderROotonRenderROot"
    );
    dom.onRenderRoot((c: Array<Element>) => {
      console.log("inside seecond one");
      console.log(c);
      setChildren([...c]);
    });
  }, [setChildren]);

  return (
    <>
      <div className={classes.appContainer}>
        <div>hi</div>
        {children.map((e) => (
          <ViewRenderer key={e.id} element={e} />
        ))}
      </div>
    </>
  );
}
