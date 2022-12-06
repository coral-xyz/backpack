import swr from "./swr";

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface Env {}

// Proxy function to rewrite hostname
const proxy = (req: Request): Request => {
  const url = new URL(req.url);
  url.host = "data.backpack.workers.dev";
  return new Request(url.toString(), req);
};

export default {
  async fetch(
    request: Request,
    _env: Env,
    ctx: ExecutionContext
  ): Promise<Response> {
    return swr(proxy(request), ctx);
  },
};
