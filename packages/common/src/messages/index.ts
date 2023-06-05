import { BACKPACK_TEAM } from "../constants";
export * from "./db";
export * from "./fromServer";
export * from "./ToPubsub";
export * from "./toServer";

export const NEW_COLORS = [
  {
    light: "#E02929",
    dark: "#F88484",
  },
  {
    light: "#CC2578",
    dark: "#E57AB0",
  },
  {
    light: "#9930B8",
    dark: "#DA8BE7",
  },
  {
    light: "#5E35B1",
    dark: "#C2A6F4",
  },
  {
    light: "#3949AB",
    dark: "#97A4F4",
  },
  {
    light: "#0072DB",
    dark: "#57AEFF",
  },
  {
    light: "#0C5ADF",
    dark: "#5596F6",
  },
  {
    light: "#008577",
    dark: "#7ACCC7",
  },
  {
    light: "#1A841F",
    dark: "#75DD7A",
  },
  {
    light: "#6C7D26",
    dark: "#BEE05A",
  },
  {
    light: "#BD5B00",
    dark: "#FFD080",
  },
  {
    light: "#CC4218",
    dark: "#FA9476",
  },
  {
    light: "#6D4C41",
    dark: "#BCAAA4",
  },
  {
    light: "#2D4363",
    dark: "#A3B5CF",
  },
];

const COLORS = [
  "#1abc9c",
  "#2ecc71",
  "#3498db",
  "#9b59b6",
  "#34495e",
  "#16a085",
  "#27ae60",
  "#8e44ad",
  "#2c3e50",
  "#e74c3c",
  "#c0392b",
  "#d35400",
  "#c0392b",
];

export const getRandomColor = () => {
  return COLORS[Math.floor(COLORS.length * Math.random())];
};

export const getRandomColorIndex = () => {
  return Math.floor(NEW_COLORS.length * Math.random());
};

export const parseMessage = (
  message: string
): { type: "text" | "tag"; value: string }[] => {
  const parts: { type: "text" | "tag"; value: string }[] = [];
  let curStr = "";
  for (let i = 0; i < message.length; i++) {
    if (message[i] === "<" && message[i + 1] === "@") {
      if (curStr) {
        parts.push({
          type: "text",
          value: curStr,
        });
        curStr = "";
      }

      while (i < message.length && message[i] !== "|") {
        i++;
      }
      i++;
      i++;
      let userId = "";
      while (i < message.length && message[i] !== ">") {
        userId += message[i];
        i++;
      }
      if (i === message.length) {
        parts.push({
          type: "text",
          value: userId,
        });
      } else {
        parts.push({
          type: "tag",
          value: userId,
        });
      }
    } else {
      curStr += message[i];
    }
  }
  if (curStr) {
    parts.push({
      type: "text",
      value: curStr,
    });
  }
  return parts;
};

const backpackSet = new Set(BACKPACK_TEAM);
export const isBackpackTeam = (id: string): boolean => backpackSet.has(id);

export interface BarterOffer {
  mint: string;
  amount: number;
  publicKey: string;
  type: "NFT" | "TOKEN";
}

export type BarterOffers = BarterOffer[];
