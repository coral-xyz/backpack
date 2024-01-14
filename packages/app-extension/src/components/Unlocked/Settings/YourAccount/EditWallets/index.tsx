import type { Blockchain } from "@coral-xyz/common";
import { ListItem } from "@coral-xyz/react-common";
import { useTheme } from "@coral-xyz/tamagui";
import { MoreHoriz } from "@mui/icons-material";
import { useNavigation } from "@react-navigation/native";

import { Routes } from "../../../../../refactor/navigation/SettingsNavigator";
import { WalletAddress } from "../../../../common";
import { ImportTypeBadge } from "../../../../common/WalletList";

export const WalletListItem: React.FC<{
  blockchain: Blockchain;
  name: string;
  publicKey: string;
  type?: string;
  isFirst: boolean;
  isLast: boolean;
  showDetailMenu: boolean;
  onClick?: () => void;
}> = ({
  blockchain,
  name,
  publicKey,
  type,
  isFirst,
  isLast,
  showDetailMenu,
  onClick,
}) => {
  const theme = useTheme();
  const navigation = useNavigation<any>();
  return (
    <ListItem
      button
      key={publicKey.toString()}
      isFirst={isFirst}
      isLast={isLast}
      detail={
        showDetailMenu ? (
          <MoreHoriz
            style={{
              cursor: "pointer",
              color: theme.baseTextMedEmphasis.val,
            }}
          />
        ) : null
      }
      onClick={
        onClick
          ? onClick
          : () =>
              navigation.push(Routes.WalletDetailScreen, {
                blockchain,
                publicKey,
                name,
                type,
              })
      }
      style={{ height: "48px", display: "flex", width: "100%" }}
    >
      <WalletAddress
        name={name}
        publicKey={publicKey}
        style={{
          fontWeight: 500,
          lineHeight: "24px",
          fontSize: "16px",
        }}
        nameStyle={{
          color: theme.baseTextHighEmphasis.val,
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
          maxWidth: "75px",
        }}
      />
      {type ? (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            flexDirection: "column",
            marginLeft: "4px",
          }}
        >
          <ImportTypeBadge type={type} />
        </div>
      ) : null}
    </ListItem>
  );
};
