import type { CoinGeckoPriceData, Environment } from "./types";

export const fetchHandler: ExportedHandlerFetchHandler<Environment> = async (
  req,
  env
): Promise<Response> => {
  if (req.method !== "GET") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  const { searchParams } = new URL(req.url);
  const idsParameter = searchParams.get("ids");

  if (!idsParameter) {
    return new Response(
      JSON.stringify({ error: "no asset ids found in url" }),
      { headers: { "Content-Type": "application/json" }, status: 400 }
    );
  }

  const ids = idsParameter.split(",");
  const values = (
    await Promise.all(ids.map((i) => env.PRICES_KV.get(i, "json")))
  ).filter((x) => x) as CoinGeckoPriceData[];

  return new Response(JSON.stringify(values), {
    headers: { "Content-Type": "application/json" },
    status: 200,
  });
};
