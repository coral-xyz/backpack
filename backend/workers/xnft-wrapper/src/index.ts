const RPC = "https://api.devnet.solana.com";

//TODO: This should always point to the most recent released renderer code
const PROD_RENDERER_URL =
  "https://unpkg.com/@coral-xyz/react-xnft-dom-renderer@0.2.0-latest.2586/dist/index.js";

export default {
  async fetch(request: Request): Promise<Response> {
    const { searchParams, pathname } = new URL(request.url);

    // @ts-ignore
    let bundle: string = searchParams.get("bundle");

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
      const res = await fetch(bundle);
      const contentType = res.headers.get("content-type");

      // if this is an new HTML based xNFT return the html directly.
      if (contentType && contentType.indexOf("text/html") > -1) {
        const contents = await res.text();
        return html(contents);
      }

      if (searchParams.has("external")) {
        // TODO: add integrity hash? https://www.srihash.org
        innerHTML = `<script src="${bundle}"></script>`;
      } else {
        const contents = await res.text();
        // TODO: see if possible to check if valid JS without executing it,
        //       because `new Function(js);` is not possible on a worker
        innerHTML = `
        <!-- code loaded from ${bundle} -->
        <script>${contents}</script>`;
      }

      innerHTML += `<script src="${PROD_RENDERER_URL}"></script>`;

      return html(`
        <!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="utf-8"/>
            <link rel="stylesheet" href="https://doof72pbjabye.cloudfront.net/fonts/inter/font.css"></link>
            <script src="https://cdn.tailwindcss.com"></script>
            <style>
              html, body {
                position:relative;
                margin: 0;
                padding: 0;
                height:100%;
                display:flex;
                flex-direction: column;
              }
              #native-container {
                display:none;
                flex-direction: column;
                flex: 1 0 100%;
              }
            </style>
          </head>
          <body>
            <div id="native-container"></div>
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
