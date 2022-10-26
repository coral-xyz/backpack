import React, { useCallback, useMemo, useState } from "react";
import { Scrollbar } from "react-scrollbars-custom";

export function ScrollbarNew({ children, ...props }) {
  const [isScrolling, setIsScrolling] = useState(false);
  const [isMouseOver, setIsMouseOver] = useState(false);
  const isShow = isScrolling || isMouseOver;

  const onScrollStart = useCallback(() => {
    setIsScrolling(true);
  }, []);
  const onScrollStop = useCallback(() => {
    setIsScrolling(false);
  }, []);
  const onMouseEnter = useCallback(() => {
    setIsMouseOver(true);
  }, []);
  const onMouseLeave = useCallback(() => {
    setIsMouseOver(false);
  }, []);

  const trackProps = useMemo(
    () => ({
      renderer: ({ elementRef, style, ...restProps }) => (
        <span
          {...restProps}
          ref={elementRef}
          style={{
            ...style,
            opacity: isShow ? 1 : 0,
            transition: "opacity 0.4s ease-in-out",
          }}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
        />
      ),
    }),
    [isShow, onMouseEnter, onMouseLeave]
  );

  return (
    <Scrollbar
      wrapperProps={{
        renderer: ({ elementRef, style, ...restProps }) => (
          <div
            {...restProps}
            ref={elementRef}
            style={{ ...style, height: "100%", right: 0, inset: "none" }}
          />
        ),
      }}
      contentProps={{
        renderer: ({ elementRef, style, ...restProps }) => (
          <div
            {...restProps}
            ref={elementRef}
            style={{ ...style, height: "100%" }}
          />
        ),
      }}
      trackXProps={trackProps}
      trackYProps={trackProps}
      onScrollStart={onScrollStart}
      onScrollStop={onScrollStop}
      scrollDetectionThreshold={500} // ms
    >
      {children}
    </Scrollbar>
  );
}
