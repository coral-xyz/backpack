import { useState, useEffect } from "react";
import { Typography, List, ListItem, IconButton } from "@mui/material";
import { Timeline } from "@mui/icons-material";
import { useCustomTheme } from "@coral-xyz/themes";
import { useEphemeralNav } from "@coral-xyz/recoil";
import { WithEphemeralNavDrawer } from "../Layout/Drawer";

export function PriceButton() {
  const theme = useCustomTheme();
  const [openDrawer, setOpenDrawer] = useState(false);
  return (
    <>
      <IconButton
        onClick={() => setOpenDrawer(true)}
        disableRipple
        style={{
          padding: 0,
        }}
      >
        <Timeline
          style={{
            color: theme.custom.colors.secondary,
          }}
        />
      </IconButton>
      <WithEphemeralNavDrawer
        openDrawer={openDrawer}
        setOpenDrawer={setOpenDrawer}
        isLeft
        backdropStyle={
          {
            //					backgroundColor: "transparent",
            ///					backgroundColor: '#00000080',
            //					backgroundColor: theme.custom.colors.background,
            //          backdropFilter: "blur(10px)",
          }
        }
      >
        <Prices close={() => setOpenDrawer(false)} />
      </WithEphemeralNavDrawer>
    </>
  );
}

function Prices({ close }: { close: () => void }) {
  const theme = useCustomTheme();
  const nav = useEphemeralNav();
  useEffect(() => {
    nav.setStyle({
      borderBottom: "none",
    });
  }, []);
  const prices = usePrices();
  return (
    <div>
      <Typography
        style={{
          color: "#FAFAFA",
          fontSize: "24px",
          fontWeight: 700,
          lineHeight: "24px",
          marginBottom: "32px",
          marginLeft: "16px",
        }}
      >
        Cryptoassets
      </Typography>
      <div></div>
      <List
        style={{
          marginLeft: "16px",
          marginRight: "16px",
          paddingLeft: "8px",
          paddingRight: "8px",
          borderRadius: "8px",
          //			background: theme.custom.colors.nav,
        }}
      >
        {prices.map((p) => {
          return (
            <ListItem
              style={{
                display: "flex",
                height: "48px",
                marginBottom: "12px",
                padding: 0,
              }}
            >
              <div
                style={{
                  display: "flex",
                  flex: 1,
                }}
              >
                <div
                  style={{
                    marginRight: "12px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                  }}
                >
                  <img
                    src={p.icon}
                    style={{
                      width: "32px",
                      height: "32px",
                      borderRadius: "16px",
                    }}
                  />
                </div>
                <div>
                  <Typography
                    style={{
                      color: "#FAFAFA", //theme.custom.colors.fontColor,
                      fontSize: "16px",
                      lineHeight: "24px",
                      fontWeight: 500,
                    }}
                  >
                    {p.name}
                  </Typography>
                  <Typography
                    style={{
                      color: theme.custom.colors.secondary,
                      fontSize: "14px",
                      lineHeight: "20px",
                      fontWeight: 500,
                    }}
                  >
                    {p.symbol}
                  </Typography>
                </div>
              </div>
              <div
                style={{
                  width: "60px",
                }}
              ></div>
              <div>
                <Typography
                  style={{
                    color: "#FAFAFA",
                    fontSize: "16px",
                    lineHeight: "24px",
                    fontWeight: 500,
                  }}
                >
                  {p.price}
                </Typography>
                <Typography
                  style={{
                    float: "right",
                    color:
                      p.percentChange > 0
                        ? theme.custom.colors.positive
                        : theme.custom.colors.negative,
                    fontSize: "16px",
                    lineHeight: "24px",
                    fontWeight: 500,
                  }}
                >
                  {p.percentChange}
                </Typography>
              </div>
            </ListItem>
          );
        })}
      </List>
    </div>
  );
}

function usePrices() {
  return [
    {
      icon: "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/9n4nbM75f5Ui33ZbPYXn59EwSgE8CGsHtAeTH5YFeJ9E/logo.png",
      name: "Bitcon",
      symbol: "BTC",
      price: "20,300",
      percentChange: -0.22,
    },
    {
      icon: "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/2FPyTwcZLUg1MDrwsyoP4D6s1tM7hAkHYRjkNb5w6Pxk/logo.png",
      name: "Ethereum",
      symbol: "ETH",
      price: "1,155",
      percentChange: 3.14,
    },
    {
      icon: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/solana/info/logo.png",
      name: "Solana",
      symbol: "SOL",
      price: "45.20",
      percentChange: 6.21,
    },
  ];
}
