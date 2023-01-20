export * from "./db";
export * from "./fromServer";
export * from "./ToPubsub";
export * from "./toServer";

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
