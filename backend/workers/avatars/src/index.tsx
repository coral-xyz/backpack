import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import Avatar from "boring-avatars";
import { Hono } from "hono";

interface Env {
  PUBLIC_AVATAR_JWT: string; // set in secret
  HASURA_URL: string; // set in secret
  nftData: { fetch: (req: Request) => Promise<Response> };
}

const app = new Hono<{ Bindings: Env }>();

app.get("/", (c) => c.json({ hello: "world" }));

app.get("/v1/:username_", (c) => {
  const size = c.req.query("size") || 200;
  return c.body(
    renderToStaticMarkup(
      <Avatar
        size={size}
        name={c.req.param("username_").toLowerCase().trim()}
        variant="pixel"
        colors={["#FEED5B", "#6260FF", "#29DBD1", "#C061F7", "#FF6F5B"]}
      />
    ),
    200,
    {
      "Content-Type": "image/svg+xml",
    }
  );
});

app.get("/:username/:cache_bust?", async (c) => {
  const username = encodeURIComponent(String(c.req.param("username")));
  const jwt = c.env.PUBLIC_AVATAR_JWT;
  const hasuraUrl = c.env.HASURA_URL;
  const size = Number(c.req.query("size")) || 500;

  // https://hasura.io/docs/latest/caching/caching-config
  const cacheDirective = c.req.query("bust_cache")
    ? `refresh: true`
    : `ttl: 30`;

  const avatarResponse = await fetch(hasuraUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-hasura-role": "public_avatar",
      Authorization: `Bearer ${jwt}`,
    },
    body: JSON.stringify({
      query: `query getAvatar($username:citext!) @cached(${cacheDirective}) {
        auth_users(limit: 1, where: {username: {_eq: $username}}) {
          avatar_nft
        }
      }`,
      variables: { username },
    }),
  });

  const avatar = (await avatarResponse.json()) as any;

  const [chain, address, id] = String(
    avatar?.data?.auth_users?.[0]?.avatar_nft ?? ""
  )
    .split("/")
    .map((x) => encodeURIComponent(x));

  c.header(
    "Cache-Control",
    `max-age=${60}, s-maxage=${60}, stale-while-revalidate=${60}`
  );

  if (chain === "ethereum") {
    const url = `https://nft-data.backpack.workers.dev/ethereum-nft/${address}/${id}/image`;
    console.log(url);
    const fetched = await c.env.nftData.fetch(new Request(url));
    const response = new Response(fetched.body, fetched);
    response.headers.set(
      "Cache-Control",
      `max-age=${60}, s-maxage=${60}, stale-while-revalidate=${60}`
    );
    return fetched;
  }

  if (chain === "solana") {
    const url = `https://nft-data.backpack.workers.dev/metaplex-nft/${address}/image`;
    console.log(url);
    const fetched = await c.env.nftData.fetch(new Request(url));
    const response = new Response(fetched.body, fetched);
    response.headers.set(
      "Cache-Control",
      `max-age=${60}, s-maxage=${60}, stale-while-revalidate=${60}`
    );
    return fetched;
  }

  // else generate default Avatar from username:
  return c.body(
    renderToStaticMarkup(
      <Avatar
        size={size}
        name={username.toLowerCase().trim()}
        variant="pixel"
        colors={["#FEED5B", "#6260FF", "#29DBD1", "#C061F7", "#FF6F5B"]}
      />
    ),
    200,
    {
      "Content-Type": "image/svg+xml",
      "Cache-Control": `max-age=${60}, s-maxage=${60}, stale-while-revalidate=${60}`,
    }
  );
});

export default app;
