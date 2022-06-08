export default {
  async fetch(request: Request): Promise<Response> {
    const { searchParams } = new URL(request.url);
    const bundle = searchParams.get("bundle");

    if (!bundle) return json({ error: "bundle parameter is required" }, 404);

    try {
      new URL(bundle);
    } catch (err) {
      return json({ error: "bundle is not a valid url" }, 500);
    }

    try {
      const script = await (async (inline) => {
        if (inline) {
          const res = await fetch(bundle);
          const js = await res.text();
          // TODO: see if possible to check if valid JS without executing it,
          //       because `new Function(js);` is not possible on a worker
          return `<script type="text/javascript" type="text/javascript">${js}</script>`;
        } else {
          // TODO: add integrity hash? https://www.srihash.org
          return `<script type="module" src="${bundle}"></script>`;
        }
      })(searchParams.has("inline"));

      return html(`
        <!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="utf-8"/>
          </head>
          <body>${script}</body>
        </html>
      `);
    } catch (err) {
      return json({ error: "error creating html" }, 500);
    }
  },
};

const html = (data: string) =>
  new Response(data, {
    headers: {
      "content-type": "text/html",
    },
  });

const json = (data: any, status) =>
  new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json",
    },
  });
