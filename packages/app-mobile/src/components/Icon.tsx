import type { SvgProps } from "react-native-svg";
import Svg, { Defs, LinearGradient, Path, Stop } from "react-native-svg";
import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import { useTheme } from "@hooks";

export const CheckBadge = (props: SvgProps) => (
  // <div
  //   style={{
  //     display: "inline-block",
  //     position: "relative",
  //     top: "4px",
  //     left: "5px",
  //   }}
  // >
  // </div>
  <Svg
    width={18}
    height={18}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <Path
      d="M9 1.5C4.86 1.5 1.5 4.86 1.5 9c0 4.14 3.36 7.5 7.5 7.5 4.14 0 7.5-3.36 7.5-7.5 0-4.14-3.36-7.5-7.5-7.5ZM6.968 12.217 4.274 9.525a.747.747 0 1 1 1.057-1.058l2.168 2.16 5.16-5.16a.747.747 0 1 1 1.057 1.058l-5.692 5.692a.747.747 0 0 1-1.058 0Z"
      fill="#42C337"
    />
  </Svg>
);

export const RedBackpack = (props: SvgProps) => (
  <Svg width={55} height={80} fill="none" {...props}>
    <Path
      d="M32.71 6.29c2.908 0 5.635.39 8.16 1.113C38.398 1.641 33.266 0 27.553 0c-5.724 0-10.866 1.647-13.333 7.437 2.507-.748 5.222-1.147 8.12-1.147H32.71Zm-11.036 5.785C7.867 12.075 0 22.937 0 36.336V50.1c0 1.34 1.12 2.4 2.5 2.4h50c1.38 0 2.5-1.06 2.5-2.4V36.336c0-13.399-9.148-24.26-22.955-24.26H21.674Zm5.806 24.38a8.75 8.75 0 1 0 0-17.5 8.75 8.75 0 0 0 0 17.5ZM0 60.59c0-1.34 1.12-2.426 2.5-2.426h50c1.38 0 2.5 1.086 2.5 2.426v14.557c0 2.68-2.239 4.852-5 4.852H5c-2.761 0-5-2.173-5-4.852V60.59Z"
      fill="#E33E3F"
    />
  </Svg>
);

export const EthereumIcon = (props: SvgProps) => (
  <Svg
    width={40}
    height={40}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <Path
      d="M20 40c11.046 0 20-8.954 20-20S31.046 0 20 0 0 8.954 0 20s8.954 20 20 20Z"
      fill="#627EEA"
    />
    <Path
      d="M20.623 5v11.087l9.37 4.188L20.624 5ZM20.622 5 11.25 20.275l9.372-4.188V5ZM20.623 27.46v7.534L30 22.02l-9.377 5.44ZM20.622 34.994v-7.535L11.25 22.02l9.372 12.974ZM20.623 25.716l9.37-5.44-9.37-4.186v9.626ZM11.25 20.275l9.372 5.441V16.09l-9.372 4.185Z"
      fill="#fff"
    />
  </Svg>
);

export const SolanaIcon = (props: SvgProps) => (
  <Svg
    width={41}
    height={40}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <Path
      d="M20.5 40c11.046 0 20-8.954 20-20s-8.954-20-20-20S.5 8.954.5 20s8.954 20 20 20Z"
      fill="#000"
    />
    <Path
      d="M40 20c0 10.77-8.73 19.5-19.5 19.5S1 30.77 1 20 9.73.5 20.5.5 40 9.23 40 20Z"
      stroke="#fff"
    />
    <Path
      d="M12.842 25.513a.804.804 0 0 1 .594-.263l18.328.015a.403.403 0 0 1 .297.674l-3.903 4.298a.805.805 0 0 1-.595.263l-18.327-.015a.403.403 0 0 1-.297-.674l3.903-4.298Zm19.219-3.578a.403.403 0 0 1-.297.675l-18.328.015a.803.803 0 0 1-.594-.263l-3.903-4.3a.403.403 0 0 1 .297-.675l18.328-.015a.804.804 0 0 1 .594.264l3.903 4.3ZM12.84 9.764a.804.804 0 0 1 .595-.263l18.328.015a.403.403 0 0 1 .297.675l-3.903 4.297a.805.805 0 0 1-.595.263l-18.327-.015a.403.403 0 0 1-.297-.675l3.903-4.297Z"
      fill="url(#a)"
    />
    <Defs>
      <LinearGradient
        id="a"
        x1={9.542}
        y1={30.958}
        x2={31.458}
        y2={9.042}
        gradientUnits="userSpaceOnUse"
      >
        <Stop />
        <Stop offset={0.2} />
        <Stop offset={1} />
      </LinearGradient>
    </Defs>
  </Svg>
);

export const PolygonIcon = (props: SvgProps) => (
  <Svg
    width={40}
    height={40}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <Path
      d="M20 40c11.046 0 20-8.954 20-20S31.046 0 20 0 0 8.954 0 20s8.954 20 20 20Z"
      fill="#8247E5"
    />
    <Path
      d="M26.496 15.799c-.464-.26-1.06-.26-1.59 0l-3.713 2.15-2.519 1.367-3.646 2.15c-.464.26-1.06.26-1.59 0l-2.85-1.694a1.583 1.583 0 0 1-.796-1.368v-3.256c0-.521.265-1.043.795-1.368l2.85-1.628c.465-.26 1.061-.26 1.591 0l2.85 1.693c.465.26.796.781.796 1.368v2.149l2.52-1.433v-2.214c0-.521-.266-1.042-.796-1.368l-5.303-3.061c-.464-.26-1.06-.26-1.591 0l-5.436 3.126a1.43 1.43 0 0 0-.795 1.303v6.122c0 .52.265 1.042.795 1.368l5.37 3.06c.463.261 1.06.261 1.59 0l3.646-2.084 2.52-1.432 3.645-2.084c.464-.261 1.06-.261 1.59 0l2.851 1.628c.464.26.796.781.796 1.367v3.257c0 .52-.265 1.042-.796 1.368l-2.784 1.628c-.464.26-1.06.26-1.59 0l-2.851-1.628a1.583 1.583 0 0 1-.796-1.368v-2.084l-2.518 1.433v2.149c0 .52.265 1.042.795 1.368l5.37 3.06c.463.261 1.06.261 1.59 0l5.37-3.06c.464-.26.795-.782.795-1.368v-6.187c0-.521-.265-1.042-.796-1.368l-5.369-3.061Z"
      fill="#fff"
    />
  </Svg>
);

export const BscIcon = (props: SvgProps) => (
  <Svg
    width={41}
    height={40}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <Path
      d="M20.5 0c11.047 0 20 8.954 20 20 0 11.047-8.953 20-20 20-11.046 0-20-8.953-20-20 0-11.046 8.954-20 20-20Z"
      fill="#F0B90B"
    />
    <Path
      d="m11.492 20 .014 5.289L16 27.933v3.096L8.877 26.85v-8.397L11.492 20Zm0-5.288v3.081l-2.617-1.548v-3.081l2.617-1.548 2.63 1.548-2.63 1.548Zm6.385-1.548 2.617-1.548 2.63 1.548-2.63 1.548-2.617-1.548Z"
      fill="#fff"
    />
    <Path
      d="M13.383 24.192v-3.096L16 22.644v3.082l-2.617-1.534Zm4.494 4.85 2.617 1.548 2.63-1.548v3.081l-2.63 1.549-2.617-1.548v-3.082Zm9-15.878 2.617-1.548 2.63 1.548v3.081l-2.63 1.548v-3.081l-2.617-1.548Zm2.617 12.125L29.508 20l2.617-1.548v8.397l-7.123 4.178v-3.096l4.492-2.642Z"
      fill="#fff"
    />
    <Path d="M27.617 24.192 25 25.726v-3.082l2.617-1.548v3.096Z" fill="#fff" />
    <Path
      d="m27.617 15.808.014 3.096-4.506 2.644v5.302l-2.617 1.533-2.617-1.534v-5.3l-4.506-2.645v-3.096l2.628-1.548 4.479 2.657 4.506-2.657 2.63 1.548h-.011ZM13.383 10.52l7.11-4.192 7.124 4.192L25 12.069l-4.506-2.657L16 12.069l-2.617-1.548Z"
      fill="#fff"
    />
  </Svg>
);

type IconProps = {
  color?: string;
  size?: number;
};

export function TwitterIcon({
  color = "#1D9BF0",
  size = 24,
}: IconProps): JSX.Element {
  return <MaterialCommunityIcons name="twitter" color={color} size={size} />;
}

export function DiscordIcon({
  color = "#5865F2",
  size = 24,
}: IconProps): JSX.Element {
  return <MaterialCommunityIcons name="discord" color={color} size={size} />;
}

export function WidgetIcon({
  color = "#E33E3F",
  size = 24,
}: IconProps): JSX.Element {
  return <MaterialCommunityIcons name="widgets" color={color} size={size} />;
}

export function MenuIcon({
  color = useTheme().custom.colors.fontColor,
  size = 24,
}: IconProps): JSX.Element {
  return <MaterialIcons name="menu" color={color} size={size} />;
}
