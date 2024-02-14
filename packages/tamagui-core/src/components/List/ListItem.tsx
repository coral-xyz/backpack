import { ListItem } from "tamagui";

export function ListItemCore({
  children,
  ...props
}: React.ComponentProps<typeof ListItem>) {
  return (
    <ListItem
      backgroundColor="$baseBackgroundL1"
      paddingHorizontal={12}
      paddingVertical={10}
      pointerEvents="box-only"
      {...props}
    >
      {children}
    </ListItem>
  );
}
