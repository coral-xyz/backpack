export function formatAMPM(date: Date) {
  let hours = date.getHours();
  let minutes: string | number = date.getMinutes();
  let ampm = hours >= 12 ? "pm" : "am";
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  minutes = minutes < 10 ? "0" + minutes : minutes;
  return hours + ":" + minutes + " " + ampm;
}

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

// Lives inside constants.ts
const BACKPACK_TEAM = new Set([
  "ee7ce804-44b2-4360-bfbb-28e14cd0499b",
  "29c33e60-d54a-4fe4-80e9-4bbfcc6c69b8",
  "446a5f21-35b9-4248-970f-7b4558f57e21",
  "6ecf7d82-095d-4fa3-9830-3567b286066d",
  "68daeda7-2c20-49ea-9dab-f7a3ebd45ab5",
  "931fac1c-0fb1-4e0a-9119-0a9112506db1",
  "47dd7685-8eb1-4d4e-bbab-b7790eebb2b9",
  "b580347f-2ec8-4600-8af1-0f5982dc93e1",
  "b6615f78-b096-4d50-b247-05db6fe74ea4",
  "7c01a3a2-dc39-4369-afb8-0dd2189412fc",
  "50752e18-8796-4702-b140-a3d78960ee94",
]);

export const isBackpackTeam = (id: string): boolean => BACKPACK_TEAM.has(id);
export const formatMessage = (message: string, users: any) => {
  const parts = parseMessage(message || "");
  const printText = parts
    .map((x) => (x.type === "tag" ? users[x.value]?.username : x.value))
    .join("");

  if (printText) {
    return printText.length > 25
      ? printText.substring(0, 22) + "..."
      : printText;
  }

  return "";
};
