const RPC = "https://api.devnet.solana.com";

//TODO: This should always point to the most recent released renderer code
const PROD_RENDERER_URL =
  "https://unpkg.com/@coral-xyz/react-xnft-dom-renderer@0.1.0-latest.2448/dist/index.js";

export default {
  async fetch(request: Request): Promise<Response> {
    const { searchParams, pathname } = new URL(request.url);

    let bundle = searchParams.get("bundle");
    let v2 = searchParams.get("v2");

    if (!bundle) {
      const xnftMint = pathname.match(/^\/(\w{30,50})/)?.[1];
      if (xnftMint) {
        try {
          const res = await fetch(
            `https://metaplex-api.gootools.workers.dev/${xnftMint}?rpc=${RPC}`
          );
          const {
            name,
            description,
            properties: { bundle: _bundle },
          } = await res.json();
          bundle = _bundle;
        } catch (err) {
          return json({ error: err.message }, 500);
        }
      }
    }

    if (bundle) {
      try {
        new URL(bundle);
      } catch (err) {
        return json({ error: "bundle is not a valid url" }, 500);
      }
    } else {
      return json({ error: "bundle parameter is required" }, 404);
    }

    try {
      let innerHTML;

      if (searchParams.has("external")) {
        // TODO: add integrity hash? https://www.srihash.org
        innerHTML = `<script src="${bundle}"></script>`;
      } else {
        const res = await fetch(bundle);
        const js = await res.text();
        // TODO: see if possible to check if valid JS without executing it,
        //       because `new Function(js);` is not possible on a worker
        innerHTML = `
        <!-- code loaded from ${bundle} -->
        <script>${js}</script>`;
      }

      if (v2) {
        innerHTML += `<script src="${PROD_RENDERER_URL}"></script>`;
      }

      return html(`
        <!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="utf-8"/>
          </head>
          <body>
            <div id="container"></div>
            ${innerHTML}
           </body>
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
