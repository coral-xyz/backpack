import { List, ListItem } from "@coral-xyz/react-common";
import { useCustomTheme } from "@coral-xyz/themes";
import { Typography } from "@mui/material";

import { WalletAddress } from "./";

export function WalletList({
  wallets,
  clickWallet,
  style,
}: {
  wallets: any;
  clickWallet: (w: any) => void;
  style: React.CSSProperties;
}) {
  return (
    <List style={style}>
      {wallets.map(
        (
          wallet: { name: string; publicKey: string; type: string },
          idx: number
        ) => {
          const { name, publicKey, type } = wallet;
          return (
            <ListItem
              key={publicKey.toString()}
              onClick={() => clickWallet(wallet)}
              isFirst={false}
              isLast={idx === wallets.length - 1}
              style={{
                paddingTop: "16px",
                paddingBottom: "16px",
                paddingLeft: "12px",
                paddingRight: "12px",
                height: "48px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  width: "100%",
                  marginLeft: "20px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      flexDirection: "column",
                      marginRight: "4px",
                    }}
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
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        maxWidth: "75px",
                      }}
                    />
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      flexDirection: "column",
                    }}
                  >
                    <ImportTypeBadge type={type} />
                  </div>
                </div>
              </div>
            </ListItem>
          );
        }
      )}
    </List>
  );
}

export function ImportTypeBadge({ type }: { type: string }) {
  const theme = useCustomTheme();
  return type === "derived" ? (
    <></>
  ) : (
    <div
      style={{
        paddingLeft: "10px",
        paddingRight: "10px",
        paddingTop: "2px",
        paddingBottom: "2px",
        backgroundColor: theme.custom.colors.bg2,
        height: "20px",
        borderRadius: "10px",
      }}
    >
      <Typography
        style={{
          color: theme.custom.colors.fontColor,
          fontSize: "12px",
          lineHeight: "16px",
          fontWeight: 600,
        }}
      >
        {type === "imported" ? "IMPORTED" : "HARDWARE"}
      </Typography>
    </div>
  );
}
