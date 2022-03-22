import { createTheme } from "@material-ui/core";

export const lightTheme = createTheme({
  palette: {},
  typography: {
    fontFamily: "Inter, sans-serif",
  },
  // @ts-ignore
  custom: {
    colors: {
      background: "#ECEFF3",
      nav: "#ffffff",
      fontColor: "#43546D",
      border: "#DBDADB",
      activeNavButton: "#00A2C7",
      hamburger: "#99A4B4",
      scrollbarThumb: "rgb(153 164 180)",
      tabIconBackground: "#99A4B4",
      tabIconSelected: "#1196B5",
      secondary: "#67758B",
      positive: "#19A51E",
      negative: "#E31B1B",
      onboardButton: "#07758E",
      sendGradient:
        "linear-gradient(180deg, #1B1D23 0%, rgba(27, 29, 35, 0) 100%)", // todo
      interactiveIconsActive: "#1196B5",
    },
  },
});

export const darkTheme = createTheme({
  palette: {},
  typography: {
    fontFamily: "Inter, sans-serif",
  },
  // @ts-ignore
  custom: {
    colors: {
      background: "#1B1D23",
      nav: "#292C33",
      fontColor: "#FFFFFF",
      border: "#393C43",
      activeNavButton: "#24B0D0",
      //			activeNavButton: "#7dffd0",
      //activeNavButton: '#ff62eb',
      hamburger: "#99A4B4",
      scrollbarThumb: "rgb(153 164 180)",
      tabIconBackground: "#99A4B4",
      tabIconSelected: "#24B0D0",
      //tabIconSelected: '#ff62eb',
      secondary: "#99A4B4",
      positive: "#35A63A",
      negative: "#E95050",
      onboardButton: "#07758E",
      sendGradient:
        "linear-gradient(180deg, #1B1D23 0%, rgba(27, 29, 35, 0) 100%)",
      swapGradient:
        "linear-gradient(180deg, #292C33 0%, rgba(41, 44, 51, 0) 100%)",
      interactiveIconsActive: "#1196B5",
      interactiveIconsHover: "#67758B",
    },
  },
});
