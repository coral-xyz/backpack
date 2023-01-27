import express from "express";

import { ensureHasPubkeyAccess, extractUserId } from "../../auth/middleware";
import { HELIUS_API_KEY } from "../../config";

const router = express.Router();

const HELIUS_API_URL = "https://api.helius.xyz/v0";

router.get("/transactions", ensureHasPubkeyAccess, async (req, res) => {
  try {
    const publicKey = req.query.publicKey;
    const url = `${HELIUS_API_URL}/addresses/${publicKey}/transactions?api-key=${HELIUS_API_KEY}`;

    const response = await fetch(url)
      .then(async (response) => {
        const json = await response.json();
        return json;
      })
      .catch((e) => {
        console.error(e);
      });

    res.json({
      transactions: response,
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
    const metadata = await fetch(
      `${HELIUS_API_URL}/tokens/metadata?api-key=${HELIUS_API_KEY}`,
      {
        method: "POST",
        body: JSON.stringify({
          mintAccounts: [mint],
        }),
      }
    )
      .then(async (response) => {
        const json = await response.json();
        return json[0];
      })
      .catch((e) => {
        console.error(e);
      });
    res.json({
      metadata,
    });
  } catch (err) {
    res.json({
      metadata: null,
    });
  }
});

export default router;
