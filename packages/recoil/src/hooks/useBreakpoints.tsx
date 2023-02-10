import { useEffect, useState } from "react";

export function useBreakpoints(): { isXs: boolean; active: string } {
  const breakpoints = {
    isXs: useMediaQuery("(max-width: 650px)") ?? window.innerWidth < 650,
    //    isMd: useMediaQuery("(min-width: 769px) and (max-width: 1024px)"),
    //    isLg: useMediaQuery("(min-width: 1025px)"),
    active: "xs",
  };
  if (breakpoints.isXs) breakpoints.active = "xs";
  //  if (breakpoints.isSm) breakpoints.active = "sm";
  //  if (breakpoints.isMd) breakpoints.active = "md";
  //  if (breakpoints.isLg) breakpoints.active = "lg";
  return breakpoints;
}

function useMediaQuery(query: string) {
  const [matches, setMatches] = useState<boolean | null>(null);
  useEffect(
    () => {
      const mediaQuery = window.matchMedia(query);
      setMatches(mediaQuery.matches);
      const handler = (event: any) => setMatches(event.matches);
      mediaQuery.addEventListener("change", handler);
      return () => mediaQuery.removeEventListener("change", handler);
    },
    [] // eslint-disable-line react-hooks/exhaustive-deps
  );
  return matches;
}

export function useWindowSize() {
  // Initialize state with undefined width/height so server and client renders match
  // Learn more here: https://joshwcomeau.com/react/the-perils-of-rehydration/
  const [windowSize, setWindowSize] = useState<any>({
    width: undefined,
    height: undefined,
  });
  useEffect(() => {
    // Handler to call on window resize
    function handleResize() {
      // Set window width/height to state
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }
    // Add event listener
    window.addEventListener("resize", handleResize);
    // Call handler right away so state gets updated with initial window size
    handleResize();
    // Remove event listener on cleanup
    return () => window.removeEventListener("resize", handleResize);
  }, []); // Empty array ensures that effect is only run on mount
  return windowSize;
}
