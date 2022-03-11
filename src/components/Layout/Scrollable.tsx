import * as React from "react";

type ScrollableProps = {
  onClick?: (event: any) => void;
  backgroundImage?: string;
  style?: any;
  overflowY?: string;
  className?: string;
  onHover?: boolean;
  onHoverClassName?: string;
};

type ScrollableState = {
  hovered: boolean;
};

export default class Scrollable extends React.Component<
  ScrollableProps,
  ScrollableState
> {
  constructor(props: ScrollableProps) {
    super(props);
    this.state = { hovered: false };
  }

  render(): React.ReactNode {
    const overflow = {
      overflowY: this.props.overflowY ? this.props.overflowY : "auto",
      overflowX: "auto",
    };
    let className = this.props.className;
    if (this.props.onHover && this.state.hovered) {
      className = this.props.onHoverClassName;
    }
    // TODO: only register onMouse listeners when onHover is set.
    return (
      <div
        style={{
          width: "100%",
          height: "100%",
          position: "relative",
          ...this.props.style,
        }}
        onMouseEnter={(): void =>
          this.setState({ ...this.state, hovered: true })
        }
        onMouseLeave={(): void =>
          this.setState({ ...this.state, hovered: false })
        }
      >
        <div
          className={className}
          style={
            {
              position: "absolute",
              top: "0",
              left: "0",
              right: "0",
              maxHeight: "100%",
              minHeight: "100%",
              display: "flex",
              flexDirection: "column",
              backgroundImage: this.props.backgroundImage
                ? this.props.backgroundImage
                : "",
              ...overflow,
            } as React.CSSProperties
          }
          onClick={this.props.onClick}
        >
          {this.props.children}
        </div>
      </div>
    );
  }
}
