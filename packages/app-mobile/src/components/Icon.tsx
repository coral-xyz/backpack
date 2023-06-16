import type { SvgProps } from "react-native-svg";

import { Pressable } from "react-native";

import { useTheme as useTamaguiTheme } from "@coral-xyz/tamagui";
import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import { themed as withThemedIcon } from "@tamagui/lucide-icons/src/themed";
import Svg, { Path, Rect } from "react-native-svg";

import { useTheme } from "~hooks/useTheme";

type TamaguiIconProp = {
  color?: string;
  size?: number;
};

export const IconButton = withThemedIcon(
  ({ onPress, name, color, size, iconStyle }) => {
    return (
      <Pressable onPress={onPress}>
        <MaterialIcons
          name={name}
          color={color}
          size={size}
          style={iconStyle}
        />
      </Pressable>
    );
  }
);

export const IconMenu = withThemedIcon(({ color, size }: TamaguiIconProp) => {
  const baseIconColor = useTamaguiTheme().baseIcon.val;
  return (
    <MaterialIcons name="menu" size={size} color={color ?? baseIconColor} />
  );
});

export const IconDropdown = withThemedIcon(
  ({ color, size }: TamaguiIconProp) => {
    const baseIconColor = useTamaguiTheme().fontColor.val;
    return (
      <MaterialIcons
        name="keyboard-arrow-down"
        size={size}
        color={color ?? baseIconColor}
      />
    );
  }
);

export const VerticalDotsIcon = ({
  size = 24,
  color = "gray",
}: {
  size?: number;
  color?: string;
}) => <MaterialCommunityIcons name="dots-vertical" size={size} color={color} />;

export const ArrowRightIcon = ({
  size = 24,
  color,
}: {
  size?: number;
  color?: string;
}) => {
  const baseIconColor = useTamaguiTheme().baseIcon.val;
  return (
    <MaterialIcons
      name="keyboard-arrow-right"
      size={size}
      color={color ?? baseIconColor}
    />
  );
};

export {
  AvalancheIcon,
  BscIcon,
  CosmosIcon,
  EthereumIcon,
  PolygonIcon,
  SolanaIcon,
} from "@coral-xyz/tamagui";

export const CheckBadge = (props: SvgProps) => (
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

export function RedBackpack(props: SvgProps) {
  return (
    <Svg
      xmlns="http://www.w3.org/2000/svg"
      width="55"
      height="80"
      viewBox="0 0 55 80"
      fill="none"
      {...props}
    >
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M32.71 6.29026C35.6178 6.29026 38.3452 6.68005 40.8705 7.40296C38.3982 1.64085 33.2649 0 27.5519 0C21.8277 0 16.6855 1.64729 14.2188 7.43692C16.7255 6.68856 19.4412 6.29026 22.339 6.29026H32.71ZM21.6739 12.0752C7.86677 12.0752 0 22.9371 0 36.336V50.1C0 51.4399 1.11929 52.5 2.5 52.5H52.5C53.8807 52.5 55 51.4399 55 50.1V36.336C55 22.9371 45.8521 12.0752 32.0449 12.0752H21.6739ZM27.4805 36.4551C32.313 36.4551 36.2305 32.5376 36.2305 27.7051C36.2305 22.8726 32.313 18.9551 27.4805 18.9551C22.648 18.9551 18.7305 22.8726 18.7305 27.7051C18.7305 32.5376 22.648 36.4551 27.4805 36.4551ZM0 60.5901C0 59.2503 1.11929 58.1641 2.5 58.1641H52.5C53.8807 58.1641 55 59.2503 55 60.5901V75.1466C55 77.8264 52.7614 79.9988 50 79.9988H5C2.23857 79.9988 0 77.8264 0 75.1466V60.5901Z"
        fill="#E33E3F"
      />
    </Svg>
  );
}

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

export function GitHubIcon({
  color = "#000",
  size = 24,
}: IconProps): JSX.Element {
  return <MaterialCommunityIcons name="github" color={color} size={size} />;
}

export function OpenInBrowserIcon({
  color = "#000",
  size = 24,
}: IconProps): JSX.Element {
  return <MaterialIcons name="open-in-browser" color={color} size={size} />;
}

export function WidgetIcon({
  color = "#E33E3F",
  size = 24,
}: IconProps): JSX.Element {
  return <MaterialCommunityIcons name="widgets" color={color} size={size} />;
}

export function ContentCopyIcon({ color, size = 24 }: IconProps): JSX.Element {
  const theme = useTheme();
  return (
    <MaterialIcons
      name="content-copy"
      color={color ? color : theme.custom.colors.fontColor}
      size={size}
    />
  );
}

export const CrossIcon = (props: SvgProps) => (
  <Svg
    width={48}
    height={48}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 48 48"
    {...props}
  >
    <Rect width={48} height={48} rx={24} fill="#E95050" />
    <Path
      d="m33.333 16.547-1.88-1.88L24 22.12l-7.453-7.453-1.88 1.88L22.12 24l-7.453 7.454 1.88 1.88L24 25.88l7.453 7.454 1.88-1.88L25.88 24l7.453-7.453Z"
      fill="#fff"
    />
  </Svg>
);

export function CheckIcon({ fill = "#35A63A" }: { fill?: string }) {
  return (
    <Svg width={48} height={48} fill="none" viewBox="0 0 48 48 ">
      <Rect width={48} height={48} rx={24} fill={fill} />
      <Path
        d="M20 29.56 14.44 24l-1.893 1.88L20 33.333l16-16-1.88-1.88L20 29.56Z"
        fill="#fff"
      />
    </Svg>
  );
}

export function IconCheckmark({
  size = 32,
  color,
}: {
  size?: number;
  color?: string;
}): JSX.Element {
  return <MaterialIcons name="check" size={size} color={color} />;
}

export function IconCheckmarkBold({
  size,
  color,
}: {
  size: number;
  color: string;
}): JSX.Element {
  return (
    <MaterialCommunityIcons
      name="check-bold"
      size={size}
      color={color}
      style={{ marginBottom: 4 }}
    />
  );
}

export function QuestionIcon({
  fill = "#A1A1AA",
  ...props
}: {
  fill?: string;
  props?: SvgProps;
}) {
  return (
    <Svg
      width={56}
      height={56}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 56 56"
      {...props}
    >
      <Path
        d="M28.335 5C15.468 5 5 15.468 5 28.335S15.468 51.67 28.335 51.67 51.67 41.202 51.67 28.335 41.202 5 28.335 5Zm-.972 36.947a2.918 2.918 0 0 1 0-5.834 2.918 2.918 0 0 1 0 5.834Zm8.383-17.254c-.601.962-1.742 2.044-3.427 3.245-2.724 2.015-2.65 2.462-2.65 4.286h-4.778c0-1.425-.031-2.52.74-3.852.491-.854 1.393-1.762 2.704-2.723 1.573-1.123 3.102-2.207 3.102-4.093 0-1.767-1.513-2.398-3.28-2.398-1.803 0-3.859.59-6.167 1.768l-1.966-3.947c4.194-2.351 10.814-3.415 14.432-.469 2.657 2.164 2.672 5.97 1.29 8.183Z"
        fill={fill}
      />
    </Svg>
  );
}

export const WarningIcon = withThemedIcon(({ color, size = 56 }) => (
  <Svg
    width={size}
    height={size}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 56 56"
    style={{ alignSelf: "center" }}
  >
    <Path
      d="M10.43 47.842h35.14c3.593 0 5.833-3.897 4.037-7l-17.57-30.357c-1.797-3.103-6.277-3.103-8.074 0L6.393 40.842c-1.796 3.103.444 7 4.037 7ZM28 31.51a2.34 2.34 0 0 1-2.333-2.334V24.51A2.34 2.34 0 0 1 28 22.175a2.34 2.34 0 0 1 2.333 2.334v4.666A2.34 2.34 0 0 1 28 31.51Zm2.333 9.333h-4.666v-4.667h4.666v4.667Z"
      fill={color}
    />
  </Svg>
));

export function EyeIcon({
  fill = "#A1A1AA",
  ...props
}: {
  fill?: string;
  props?: SvgProps;
}) {
  return (
    <Svg
      width={40}
      height={40}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 40 40"
      style={{ alignSelf: "center" }}
      {...props}
    >
      <Path
        d="M20 10.783c4.6 0 8.334 3.734 8.334 8.334 0 .85-.167 1.666-.4 2.433l5.1 5.1a19.67 19.67 0 0 0 5.3-7.55C35.45 11.8 28.334 6.617 20 6.617c-2.116 0-4.15.333-6.066.95l3.616 3.616c.784-.233 1.6-.4 2.45-.4ZM4.517 5.217c-.65.65-.65 1.7 0 2.35L7.8 10.85C5.1 13 2.95 15.833 1.667 19.117c2.883 7.316 10 12.5 18.333 12.5 2.534 0 4.95-.5 7.184-1.367l4.533 4.533c.65.65 1.7.65 2.35 0 .65-.65.65-1.7 0-2.35L6.884 5.217a1.68 1.68 0 0 0-2.367 0ZM20 27.45a8.336 8.336 0 0 1-8.333-8.333c0-1.284.3-2.5.817-3.567l2.616 2.617c-.05.3-.1.616-.1.95 0 2.766 2.234 5 5 5 .334 0 .634-.05.95-.117l2.617 2.617A8.02 8.02 0 0 1 20 27.45Zm4.95-8.883a4.948 4.948 0 0 0-4.4-4.4l4.4 4.4Z"
        fill={fill}
      />
    </Svg>
  );
}

export function ExpandCollapseIcon({
  isExpanded,
  size = 24,
  color,
}: {
  isExpanded: boolean;
  size?: number;
  color?: string;
}): JSX.Element {
  const theme = useTheme();
  return (
    <MaterialIcons
      name={isExpanded ? "keyboard-arrow-up" : "keyboard-arrow-down"}
      size={size}
      color={color ? color : theme.custom.colors.fontColor}
    />
  );
}

export function IconCloseModal({
  tintColor,
}: {
  tintColor: string;
}): JSX.Element {
  return (
    <MaterialIcons
      name="close"
      size={28}
      color={tintColor}
      style={{ padding: 8 }}
    />
  );
}

export function HardwareIcon({
  fill = "#8F929E",
  size = 24,
}: {
  fill?: string;
  size?: number;
}): JSX.Element {
  return (
    <Svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      fill="none"
      viewBox="0 0 24 24"
    >
      <Path
        d="M8.555 10.887c-.309 0-.575.107-.79.32a1.064 1.064 0 0 0-.324.783c0 .307.108.57.324.784.215.213.481.32.79.32.31 0 .575-.107.79-.32.216-.213.325-.477.325-.784 0-.306-.109-.57-.324-.783a1.086 1.086 0 0 0-.79-.32ZM18.807 8.5H5.923a.785.785 0 0 0-.573.222.794.794 0 0 0-.225.588v5.263c0 .247.07.464.215.645a.718.718 0 0 0 .583.282h12.884a.738.738 0 0 0 .603-.282c.145-.18.215-.398.215-.645V9.31a.794.794 0 0 0-.225-.588.811.811 0 0 0-.593-.222Zm-.62 5.576H6.563V9.924h11.625v4.152Z"
        fill={fill}
        stroke="#8F929E"
        opacity={0.5}
      />
    </Svg>
  );
}

export function ImportedIcon({
  fill = "#8F929E",
  size = 24,
}: {
  fill?: string;
  size?: number;
}): JSX.Element {
  return (
    <Svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      fill="none"
      viewBox="0 0 24 24"
    >
      <Path
        d="M11.56 6.058 8.378 9.24a.625.625 0 1 0 .884.884l2.115-2.115V14.5a.625.625 0 0 0 1.25 0V8.009l2.115 2.115a.625.625 0 1 0 .884-.884l-3.182-3.182a.625.625 0 0 0-.884 0Z"
        fill={fill}
        stroke="#8F929E"
      />
      <Path stroke="#8F929E" d="M8.25 16.377h7.5" />
    </Svg>
  );
}

export function MnemonicIcon({
  fill = "#8F929E",
}: {
  fill?: string;
}): JSX.Element {
  return <ImportedIcon fill={fill} />;
}

export function TabIconBalances({ fill = "#99A4B4", ...props }) {
  return (
    <Svg
      xmlns="http://www.w3.org/2000/svg"
      width={24}
      height={24}
      fill="none"
      viewBox="0 0 24 24"
      {...props}
    >
      <Path
        d="m15.766 5 3-5H5.234l3 5h7.532ZM16.416 7H7.583C5.416 9.305 2 13.492 2 17c0 2.1.975 7 10 7s10-4.9 10-7c0-3.508-3.418-7.695-5.584-10Z"
        fill={fill}
      />
    </Svg>
  );
}
export function TabIconApps({ fill = "#99A4B4", ...props }) {
  return (
    <Svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      {...props}
    >
      <Path
        d="M9 1H3C1.89543 1 1 1.89543 1 3V9C1 10.1046 1.89543 11 3 11H9C10.1046 11 11 10.1046 11 9V3C11 1.89543 10.1046 1 9 1Z"
        fill={fill}
      />
      <Path
        d="M23.4285 4.61798L19.3815 0.571977C19.0147 0.206683 18.5182 0.00158691 18.0005 0.00158691C17.4829 0.00158691 16.9863 0.206683 16.6195 0.571977L12.5725 4.61798C12.2071 4.9851 12.002 5.48199 12.002 5.99998C12.002 6.51796 12.2071 7.01486 12.5725 7.38198L16.6195 11.429C16.9863 11.7943 17.4829 11.9994 18.0005 11.9994C18.5182 11.9994 19.0147 11.7943 19.3815 11.429L23.4285 7.38298C23.7942 7.01582 23.9996 6.5187 23.9996 6.00048C23.9996 5.48225 23.7942 4.98514 23.4285 4.61798Z"
        fill={fill}
      />
      <Path
        d="M21 13H15C13.8954 13 13 13.8954 13 15V21C13 22.1046 13.8954 23 15 23H21C22.1046 23 23 22.1046 23 21V15C23 13.8954 22.1046 13 21 13Z"
        fill={fill}
      />
      <Path
        d="M9 13H3C1.89543 13 1 13.8954 1 15V21C1 22.1046 1.89543 23 3 23H9C10.1046 23 11 22.1046 11 21V15C11 13.8954 10.1046 13 9 13Z"
        fill={fill}
      />
    </Svg>
  );
}

export function TabIconNfts({ fill = "#99A4B4", ...props }) {
  return (
    <Svg
      xmlns="http://www.w3.org/2000/svg"
      width={24}
      height={24}
      fill="none"
      viewBox="0 0 24 24"
      {...props}
    >
      <Path
        fill={fill}
        d="M20 1H4a3 3 0 0 0-3 3v16a3 3 0 0 0 3 3h16a3 3 0 0 0 3-3V4a3 3 0 0 0-3-3ZM9.5 6a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Zm9.425 10.763A.5.5 0 0 1 18.5 17h-13a.5.5 0 0 1-.424-.765l2.5-4a.5.5 0 0 1 .808-.055l2.095 2.514L14.6 9.2a.516.516 0 0 1 .445-.2.5.5 0 0 1 .4.274l3.5 7a.5.5 0 0 1-.02.489Z"
      />
    </Svg>
  );
}

export function TabIconMessages({ fill = "#99A4B4", ...props }) {
  return (
    <Svg
      width="22"
      height="21"
      viewBox="0 0 22 21"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <Path
        d="M6.5999 10.9C6.96657 10.9 7.2749 10.775 7.5249 10.525C7.7749 10.275 7.8999 9.96667 7.8999 9.6C7.8999 9.23333 7.7749 8.925 7.5249 8.675C7.2749 8.425 6.96657 8.3 6.5999 8.3C6.23324 8.3 5.9249 8.425 5.6749 8.675C5.4249 8.925 5.2999 9.23333 5.2999 9.6C5.2999 9.96667 5.4249 10.275 5.6749 10.525C5.9249 10.775 6.23324 10.9 6.5999 10.9ZM10.9999 10.9C11.3666 10.9 11.6749 10.775 11.9249 10.525C12.1749 10.275 12.2999 9.96667 12.2999 9.6C12.2999 9.23333 12.1749 8.925 11.9249 8.675C11.6749 8.425 11.3666 8.3 10.9999 8.3C10.6332 8.3 10.3249 8.425 10.0749 8.675C9.8249 8.925 9.6999 9.23333 9.6999 9.6C9.6999 9.96667 9.8249 10.275 10.0749 10.525C10.3249 10.775 10.6332 10.9 10.9999 10.9ZM15.3999 10.9C15.7666 10.9 16.0749 10.775 16.3249 10.525C16.5749 10.275 16.6999 9.96667 16.6999 9.6C16.6999 9.23333 16.5749 8.925 16.3249 8.675C16.0749 8.425 15.7666 8.3 15.3999 8.3C15.0332 8.3 14.7249 8.425 14.4749 8.675C14.2249 8.925 14.0999 9.23333 14.0999 9.6C14.0999 9.96667 14.2249 10.275 14.4749 10.525C14.7249 10.775 15.0332 10.9 15.3999 10.9ZM0.149902 18.65V3.9C0.149902 3.01667 0.453902 2.27067 1.0619 1.662C1.67057 1.054 2.41657 0.75 3.2999 0.75H18.6999C19.5832 0.75 20.3292 1.054 20.9379 1.662C21.5459 2.27067 21.8499 3.01667 21.8499 3.9V15.3C21.8499 16.1833 21.5459 16.9293 20.9379 17.538C20.3292 18.146 19.5832 18.45 18.6999 18.45H4.1499L2.8249 19.775C2.3249 20.275 1.75424 20.3877 1.1129 20.113C0.470902 19.8377 0.149902 19.35 0.149902 18.65V18.65Z"
        fill={fill}
      />
    </Svg>
  );
}
