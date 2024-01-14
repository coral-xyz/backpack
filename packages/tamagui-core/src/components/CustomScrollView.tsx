import type { ScrollbarsProps } from "rc-scrollbars";

import { Scrollbars } from "rc-scrollbars";

export function CustomScrollView(props: Partial<ScrollbarsProps>) {
  return (
    <Scrollbars
      {...props}
      hideTracksWhenNotNeeded={props.hideTracksWhenNotNeeded ?? true}
      autoHide={props.autoHide ?? true}
      autoHeight={props.autoHeight ?? true}
      autoHeightMin={props.autoHeightMin ?? "100%"}
    >
      {props.children}
    </Scrollbars>
  );
}
