import Avatar from "boring-avatars";
import { Hono } from "hono";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

const app = new Hono();

app.get("/", (c) => c.json({ hello: "world" }));

app.get("/v1/:username", (c) => {
  const size = c.req.query("size") || 200;
  return c.body(
    renderToStaticMarkup(
      <Avatar
        size={size}
        name={c.req.param("username").toLowerCase().trim()}
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

export default app;
