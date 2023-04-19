export interface Env {
  // in secrets, see `npx wrangler secret --help`
  RPC_URL: string;
  BACKUP_RPC_URL: string;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method === "OPTIONS") {
      return new Response("ok", {
        headers: {
          "Access-Control-Allow-Headers": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Origin": "*",
        },
      });
    } else if (
      // POST for https
      request.method === "POST" ||
      // GET for websockets
      (request.method === "GET" && request.headers.get("Upgrade"))
    ) {
      // TODO:  is there a alternative way of doing this without cloning?
      //        The ReadableStream cannot be read again unless it's been
      //        cloned, as it is read and consumed during the first fetch
      const clonedRequestForBackupAttempt = request.clone();

      let response = await fetchRpc(request, env.RPC_URL);

      if (!response) {
        // Initial attempt failed, try to fetch using backup RPC if it exists
        response = await fetchRpc(
          clonedRequestForBackupAttempt,
          env.BACKUP_RPC_URL || env.RPC_URL // try again in no backup exists
        );
      }

      if (!response) {
        return new Response("Unable to fetch from primary or backup RPCs", {
          status: 503,
        });
      }

      return response;
    } else {
      return new Response(
        "Only POST, OPTIONS or WebSocket Upgrade GET requests are allowed",
        {
          status: 405,
        }
      );
    }
  },
};

async function fetchRpc(
  request: Request,
  rpcUrl: string
): Promise<Response | null> {
  try {
    const { href, hostname } = new URL(rpcUrl);

    const rpcResponse = await fetch(
      href,
      (() => {
        const _request = new Request(href, request);
        // Only forward necessary headers from the client request
        sanitizeHeaders(_request.headers);
        return _request;
      })()
    );

    if (
      !rpcResponse.ok &&
      rpcResponse.status !== 101 // for websockets
    ) {
      throw new Error(`unable to fetch ${rpcResponse.status}`);
    }

    const response = new Response(rpcResponse.body, rpcResponse);
    response.headers.append("x-backpack-rpc", hostname);

    return response;
  } catch (error) {
    console.error(`Fetch failed for RPC URL: ${rpcUrl}`, error);
    return null;
  }
}

const sanitizeHeaders = (headers: Headers) => {
  const allowedHeaders = [
    "accept-encoding",
    "accept",
    "cache-control",
    "connection",
    "content-encoding",
    "content-length",
    "content-type",
    "solana-client",
    "upgrade",
  ];
  headers.forEach((_value, key) => {
    if (!allowedHeaders.includes(key.toLowerCase())) {
      headers.delete(key);
    }
  });
};
