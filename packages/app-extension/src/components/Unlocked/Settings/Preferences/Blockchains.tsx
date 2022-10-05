import { useEffect } from "react";
import { ListItemText } from "@mui/material";
import { useCustomTheme } from "@coral-xyz/themes";
import { useNavStack } from "../../../common/Layout/NavStack";
import { List, ListItem } from "../../../common";

export function PreferencesBlockchains() {
  const theme = useCustomTheme();
  const nav = useNavStack();

  useEffect(() => {
    nav.setTitle("Blockchains");
  }, [nav]);

  const availableBlockchains = ["Solana", "Ethereum"];

  return (
    <List
      style={{
        marginTop: "16px",
        border: `${theme.custom.colors.borderFull}`,
      }}
    >
      {availableBlockchains.map((blockchain, i) => (
        <ListItem
          id={blockchain}
          button={false}
          key={i}
          isFirst={i === 0}
          isLast={i === availableBlockchains.length - 1}
          detail={<></>}
        >
          <ListItemText style={{ fontWeight: 500 }}>{blockchain}</ListItemText>
        </ListItem>
      ))}
    </List>
  );
}
