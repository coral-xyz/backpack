import { fetchHandler } from "./fetched";
import { scheduledHandler } from "./scheduled";
import type { Environment } from "./types";

const handler: ExportedHandler<Environment> = {
  fetch: fetchHandler,
  scheduled: scheduledHandler,
};

export default handler;
