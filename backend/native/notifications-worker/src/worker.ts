import { processMessage } from "./processors";
import { Redis } from "./Redis";

export const processQueue = async () => {
  const response = await Redis.getInstance().fetch();
  await processResponse(response);
  return processQueue();
};

const processResponse = async (response: string) => {
  try {
    const parsedResponse = JSON.parse(response);
    const { type, payload } = parsedResponse;
    switch (type) {
      case "message":
        await processMessage(payload);
        break;
    }
  } catch (e) {
    console.log(`ERROR: while processing queue`);
    console.log(e);
  }
};

process.on("uncaughtException", function (err) {
  console.log("Caught exception: " + err);
});
