import { MaterialIcons } from "@expo/vector-icons";

export type MaterialIconName = React.ComponentProps<
  typeof MaterialIcons
>["name"];

export const IconKeyboardArrowRight = () => (
  <MaterialIcons name="keyboard-arrow-right" size={24} color="gray" />
);

export function IconCheckmark({
  size = 32,
  color,
}: {
  size?: number;
  color?: string;
}): JSX.Element {
  return <MaterialIcons name="check" size={size} color={color} />;
}

export const getIcon = (name: MaterialIconName) => (
  <MaterialIcons name={name} size={28} color="gray" />
);
