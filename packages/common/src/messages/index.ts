export * from "./db";
export * from "./fromServer";
export * from "./ToPubsub";
export * from "./toServer";

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
