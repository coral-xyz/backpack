import { YGroup, Separator } from "@coral-xyz/tamagui";

import { ListItemLabelValue } from "~components/ListItem";

// TODO(peter) decide if this needs to be used everywhere
function TableWrapper({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  return (
    <YGroup
      overflow="hidden"
      borderWidth={2}
      borderColor="$borderFull"
      borderRadius="$container"
      backgroundColor="$nav"
      separator={<Separator />}
    >
      {children}
    </YGroup>
  );
}

export type Row = {
  label: string;
  value?: string;
  children?: JSX.Element;
  onPress?: () => void;
};

export type MenuItem = {
  [key: string]: Row;
};

type TableListProps = {
  menuItems: MenuItem;
};

export function Table({ menuItems }: TableListProps): JSX.Element {
  return (
    <TableWrapper>
      {Object.entries(menuItems).map(([key, row]) => {
        if (row.value && row.children) {
          throw new Error("pick one: value or children");
        }
        return (
          <YGroup.Item key={key}>
            <ListItemLabelValue
              label={row.label}
              value={row.value}
              children={row.children}
              onPress={row.onPress}
            />
          </YGroup.Item>
        );
      })}
    </TableWrapper>
  );
}
