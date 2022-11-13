const RPC = "https://api.devnet.solana.com";

//TODO: This should always point to the most recent released renderer code
const PROD_RENDERER_URL =
  "https://unpkg.com/@coral-xyz/react-xnft-dom-renderer@0.2.0-latest.427/dist/index.js";

const V1_BUNDLES: string[] = [
  "https://ipfs.io/ipfs/bafybeibhd37z7osxbp2fvxcenid6uufsvrpumawxw4ked7h2br4duz3sme",
  "https://xnfts.s3.us-west-2.amazonaws.com/4AwaNy62XXNhgEbe3Szk9Tb7eEgDcHG3YbpEzdX8DPj5/bundle/index.js",
  "https://xnfts.s3.us-west-2.amazonaws.com/9Tqzi3gb4jE3D8Ez79HUTjFfS9f9ES31NjXez6yaffd7/bundle/index.js",
  "https://xnfts.s3.us-west-2.amazonaws.com/3i8Av28osHPoWZzWRoU29JBmfSJEcFtJhDzBTLhFG1u6/bundle/index.js",
  "https://xnfts.s3.us-west-2.amazonaws.com/4QaPNGJFsdqT5cbURcLcVGPQD8GgCpNM6Bmf2p88ex2f/bundle/index.js",
  "https://xnfts.s3.us-west-2.amazonaws.com/HGVjbFZdHuEK1e8MAXte5hG9NquPSig5RobdLvyXvSXG/bundle/index.js",
  "https://ipfs.io/ipfs/bafybeiekyqolvv7xwtg5mp65wnpsumzf7kns4fiticgdmgbrh5wdmbm5ve",
  "https://ipfs.io/ipfs/bafybeig4hrp7prl5afffpv2wzd4dmmxlrg7f4oj3vnytwpnjzxy7gh22ve",
  "https://ipfs.io/ipfs/bafybeignivvx6ilmx3hrcekwk53riant44knedielglpa3pirh76ld7tse",
  "https://ipfs.io/ipfs/bafybeifwqc6zlfh4in56y2cptfa64rivqlqunu5kfxy43rxlacm7kqbjz4",
];

export default {
  async fetch(request: Request): Promise<Response> {
    const { searchParams, pathname } = new URL(request.url);

    // @ts-ignore
    let bundle: string = searchParams.get("bundle");
    let v2 = searchParams.get("v2");

    // TODO Remove this logic few days after the new renderer releases
    if (v2 && V1_BUNDLES.includes(bundle)) {
      // Upgrade Warning example xnft bundle
      bundle =
        "https://xnfts-dev.s3.us-west-2.amazonaws.com/warning-xnft/index-new-wallet-warning.js";
    }

    if (!v2 && !V1_BUNDLES.includes(bundle)) {
      bundle =
        "https://xnfts-dev.s3.us-west-2.amazonaws.com/warning-xnft/index-old-wallet-warning.js";
    }

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
            <link rel="stylesheet" href="https://doof72pbjabye.cloudfront.net/fonts/inter/font.css"></link>
            <script src="https://cdn.tailwindcss.com"></script>
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
