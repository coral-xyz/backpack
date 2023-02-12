import express from "express";

import { HELIUS_API_KEY } from "../../config";

const router = express.Router();

const HELIUS_API_URL = "https://api.helius.xyz/v0";

router.get("/transactions", async (req, res) => {
  try {
    const publicKey = req.query.publicKey;
    const url = `${HELIUS_API_URL}/addresses/${publicKey}/transactions?api-key=${HELIUS_API_KEY}`;

    const response = await fetch(url);
    const json = await response.json();

    res.json({
      transactions: json,
    });
  } catch (err) {
    res.json({
      transactions: [],
    });
  }
});

router.get("/nftMetadata", async (req, res) => {
  try {
    const mint = req.query.mint;
    const metadataResponse = await fetch(
      `${HELIUS_API_URL}/token-metadata?api-key=${HELIUS_API_KEY}`,
      {
        method: "POST",
        body: JSON.stringify({
          mintAccounts: [mint],
          includeOffChain: false,
        }),
      }
    );
    const json = await metadataResponse.json();
    const metadata = json[0];
    if (json?.[0]) {
      res.json({
        metadata,
      });
    } else {
      res.json({
        metadata: null,
      });
    }
  } catch (err) {
    res.json({
      metadata: null,
    });
  }
});

export default router;
