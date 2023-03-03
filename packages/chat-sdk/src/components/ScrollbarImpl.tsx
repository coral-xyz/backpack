import { Scrollbars } from "react-custom-scrollbars";
import { useCustomTheme } from "@coral-xyz/themes";

export function ScrollBarImpl(props: any) {
  const theme = useCustomTheme();
  return (
    <>
      <Scrollbars
        onScrollStop={props.onScrollStop}
        ref={(e) => props.setRef?.(e)}
        style={{
          width: "100%",
          height: props.height || "100%",
          position: "absolute",
        }}
        renderTrackHorizontal={(props: any) => (
          <div {...props} className="track-horizontal" />
        )}
        renderTrackVertical={(props: any) => (
          <div
            style={{ backgroundColor: theme.custom.colors.scrollbarTrack }}
            {...props}
            className="track-vertical"
          />
        )}
        renderThumbHorizontal={(props: any) => (
          <div {...props} className="thumb-horizontal" />
        )}
        renderThumbVertical={(props: any) => (
          <div
            style={{ backgroundColor: theme.custom.colors.scrollbarThumb }}
            {...props}
            className="thumb-vertical"
          />
        )}
        renderView={(props: any) => <div {...props} className="view" />}
        autoHide
        thumbMinSize={30}
      >
        {props.children}
      </Scrollbars>
      <style>
        {`
          .track-vertical {
            background: ${theme.custom.colors.scrollbarTrack};
          }
          .track-vertical .thumb-vertical {
            background-color: ${theme.custom.colors.scrollbarThumb};
          }
				`}
      </style>
    </>
  );
}
