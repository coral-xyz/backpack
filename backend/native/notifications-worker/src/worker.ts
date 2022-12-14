import { processMessage } from "./processors";
import { Redis } from "./Redis";

export const processQueue = async () => {
  const response = await Redis.getInstance().fetch();
  await processResponse(response);
  return processQueue();
};

const processResponse = (response: string) => {
  try {
    const parsedResponse = JSON.parse(response);
    const { type, payload } = parsedResponse;
    switch (type) {
      case "message":
        processMessage(payload);
    }
  } catch (e) {
    console.log(`ERROR: while processing queue`);
    console.log(e);
  }
};
