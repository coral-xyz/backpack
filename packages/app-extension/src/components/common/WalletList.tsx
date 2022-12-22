import { List, ListItem } from "@coral-xyz/react-common";
import { useCustomTheme } from "@coral-xyz/themes";
import CheckIcon from "@mui/icons-material/Check";
import ErrorIcon from "@mui/icons-material/Error";
import { Typography } from "@mui/material";

import { WalletAddress } from "./";

export function WalletList({
  wallets,
  clickWallet,
  style,
  selectedWalletPublicKey,
  disableIconPadding,
}: {
  wallets: any;
  clickWallet: (w: any) => void;
  style: React.CSSProperties;
  selectedWalletPublicKey?: string;
  disableIconPadding?: boolean;
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
                  marginLeft: disableIconPadding ? undefined : "20px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                  }}
                >
                  <div style={{ marginRight: "8px" }}>
                    <ImportTypeBadge type={type} />
                  </div>
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
                </div>
                {selectedWalletPublicKey &&
                  selectedWalletPublicKey === publicKey.toString() && (
                    <CheckIcon />
                  )}
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

  const icon = {
    derived: <MnemonicIcon />,
    imported: <ImportedIcon />,
    hardware: <HardwareIcon />,
    dehydrated: (
      <ErrorIcon
        style={{
          color: theme.custom.colors.dangerButton,
          height: "32px",
          width: "32px",
          padding: "8px",
        }}
      />
    ),
  }[type];

  return icon!;
}

export function MnemonicIcon() {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g clip-path="url(#clip0_14342_46236)">
        <path
          fill-rule="evenodd"
          clip-rule="evenodd"
          d="M17.542 8.75805C18.1236 8.75805 18.669 8.83601 19.1741 8.98059C18.6796 7.82817 17.653 7.5 16.5104 7.5C15.3655 7.5 14.3371 7.82946 13.8438 8.98738C14.3451 8.83771 14.8882 8.75805 15.4678 8.75805H17.542ZM15.3348 9.91504C12.5734 9.91504 11 12.0874 11 14.7672V17.52C11 17.788 11.2239 18 11.5 18H21.5C21.7761 18 22 17.788 22 17.52V14.7672C22 12.0874 20.1704 9.91504 17.409 9.91504H15.3348ZM16.4961 14.791C17.4626 14.791 18.2461 14.0075 18.2461 13.041C18.2461 12.0745 17.4626 11.291 16.4961 11.291C15.5296 11.291 14.7461 12.0745 14.7461 13.041C14.7461 14.0075 15.5296 14.791 16.4961 14.791ZM11 19.618C11 19.3501 11.2239 19.1328 11.5 19.1328H21.5C21.7761 19.1328 22 19.3501 22 19.618V22.5293C22 23.0653 21.5523 23.4998 21 23.4998H12C11.4477 23.4998 11 23.0653 11 22.5293V19.618Z"
          fill="#555C6B"
        />
      </g>
      <defs>
        <clipPath id="clip0_14342_46236">
          <rect
            width="11"
            height="16"
            fill="white"
            transform="translate(11 7.5)"
          />
        </clipPath>
      </defs>
    </svg>
  );
}

export function ImportedIcon() {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M15.4401 7.60687L11.1974 11.8495C10.8883 12.1587 10.8883 12.6599 11.1974 12.9691C11.5066 13.2783 12.0079 13.2783 12.317 12.9691L15.2082 10.0779L15.2082 18.8333C15.2082 19.2706 15.5627 19.625 15.9999 19.625C16.4371 19.625 16.7916 19.2706 16.7916 18.8333L16.7916 10.0779L19.6827 12.9691C19.9919 13.2783 20.4932 13.2783 20.8023 12.9691C21.1115 12.6599 21.1115 12.1587 20.8023 11.8495L16.5597 7.60687C16.2505 7.29771 15.7493 7.29771 15.4401 7.60687Z"
        fill="#555C6B"
        stroke="#8F929E"
        stroke-width="0.25"
      />
      <line
        x1="10.75"
        y1="22.0859"
        x2="21.25"
        y2="22.0859"
        stroke="#555C6B"
        stroke-width="1.5"
        stroke-linecap="round"
      />
    </svg>
  );
}

export function HardwareIcon() {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M11.4069 14.5576C11.0057 14.5576 10.6615 14.6959 10.3823 14.972C10.1029 15.2481 9.9625 15.589 9.9625 15.987C9.9625 16.3849 10.1029 16.7258 10.3823 17.0019C10.6615 17.278 11.0057 17.4163 11.4069 17.4163C11.8082 17.4163 12.1524 17.278 12.4316 17.0019C12.711 16.7258 12.8514 16.3849 12.8514 15.987C12.8514 15.589 12.711 15.2481 12.4316 14.972C12.1524 14.6959 11.8082 14.5576 11.4069 14.5576ZM25.0764 11.375H7.89722C7.60484 11.375 7.3563 11.4677 7.16282 11.6589C6.96761 11.8519 6.875 12.108 6.875 12.413V19.4304C6.875 19.7513 6.96634 20.0319 7.15313 20.2651C7.34361 20.503 7.5948 20.625 7.89722 20.625H25.0764C25.3935 20.625 25.6546 20.5052 25.8469 20.2651C26.0337 20.0319 26.125 19.7513 26.125 19.4304V12.413C26.125 12.108 26.0324 11.8519 25.8372 11.6589C25.6421 11.4661 25.3838 11.375 25.0764 11.375ZM24.2917 18.8098H8.70833V13.1902H24.2917V18.8098Z"
        fill="#8F929E"
        stroke="#8F929E"
        stroke-width="0.25"
      />
    </svg>
  );
}
