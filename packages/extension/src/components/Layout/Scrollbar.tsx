import { useTheme } from "@mui/material";
import { Scrollbars } from "react-custom-scrollbars";

export function Scrollbar(props: any) {
  const theme = useTheme() as any;
  return (
    <>
      <Scrollbars
        style={{ width: "100%", height: "100%" }}
        renderTrackHorizontal={(props) => (
          <div {...props} className="track-horizontal" />
        )}
        renderTrackVertical={(props) => (
          <div
            style={{ backgroundColor: theme.custom.colors.scrollbarTrack }}
            {...props}
            className="track-vertical"
          />
        )}
        renderThumbHorizontal={(props) => (
          <div {...props} className="thumb-horizontal" />
        )}
        renderThumbVertical={(props) => (
          <div
            style={{ backgroundColor: theme.custom.colors.scrollbarThumb }}
            {...props}
            className="thumb-vertical"
          />
        )}
        renderView={(props) => <div {...props} className="view" />}
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
