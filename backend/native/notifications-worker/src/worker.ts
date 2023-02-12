import {
  processFannedOutMessage,
  processFriendRequest,
  processFriendRequestAccept,
  processMessage,
} from "./processors";
import { Redis } from "./Redis";

export const processQueue = async () => {
  await new Promise<void>(async (resolve) => {
    const response = await Redis.getInstance().fetch();
    if (!response) {
      console.log(`Nothing left to process`);
      setTimeout(resolve, 5000);
    } else {
      const timeout = setTimeout(() => {
        resolve();
      }, 10 * 1000);
      console.log(`Processing ${response}`);
      await processResponse(response);
      clearTimeout(timeout);
      resolve();
    }
  });
};

const processResponse = async (response: string) => {
  try {
    const parsedResponse = JSON.parse(response);
    const { type, payload } = parsedResponse;
    switch (type) {
      case "message":
        await processMessage(payload);
        break;
      case "friend_request":
        await processFriendRequest(payload);
        break;
      case "friend_request_accept":
        await processFriendRequestAccept(payload);
        break;
      case "fanned-out-group-message":
        await processFannedOutMessage(payload);
    }
  } catch (e) {
    console.log(`ERROR: while processing queue`);
    console.log(e);
  }
};

process.on("uncaughtException", function (err) {
  console.log("Caught exception: " + err);
});
