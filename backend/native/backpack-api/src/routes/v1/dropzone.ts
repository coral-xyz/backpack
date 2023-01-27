import { emptyWallet } from "@cardinal/common";
import { Chain } from "@coral-xyz/zeus";
import { MerkleDistributorSDK, utils } from "@saberhq/merkle-distributor";
import { SignerWallet, SolanaProvider } from "@saberhq/solana-contrib";
import { u64 } from "@saberhq/token-utils";
import { Connection, PublicKey } from "@solana/web3.js";
import { encode } from "bs58";
import cors from "cors";
import type { NextFunction, Request, Response } from "express";
import express from "express";

import { HASURA_URL, JWT } from "../../config";

const router = express.Router();
router.use(cors({ origin: "*" }));

/**
 * Creates a distributor transaction, stores data in the DB, returns
 * the transaction to be signed
 */
router.post("/drops", async (req, res, next) => {
  try {
    const provider = createProvider(new PublicKey(req.body.creator));
    const sdk = MerkleDistributorSDK.load({ provider });
    const _tree = req.body.balances;

    const tree = new utils.BalanceTree(
      _tree.map((t) => ({
        account: new PublicKey(t.account),
        amount: new u64(t.amount),
      }))
    );

    const maxTotalClaim = new u64(
      _tree.reduce((acc, curr) => acc + curr.amount, 0)
    );
    const maxNumNodes = new u64(_tree.length);

    const pendingDistributor = await sdk.createDistributor({
      root: tree.getRoot(),
      maxTotalClaim,
      maxNumNodes,
      tokenMint: new PublicKey(req.body.mint),
    });

    const tx = pendingDistributor.tx.build();
    const { blockhash, lastValidBlockHeight } =
      await provider.connection.getLatestBlockhash();
    tx.recentBlockhash = blockhash;
    tx.lastValidBlockHeight = lastValidBlockHeight;

    new SignerWallet(pendingDistributor.tx.signers[0]).signTransaction(tx);

    await fetch(HASURA_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${JWT}`,
      },
      body: JSON.stringify({
        query: `
          mutation ($object:dropzone_distributors_insert_input!) {
            insert_dropzone_distributors_one(object: $object) { id }
          }`,
        variables: {
          object: {
            id: pendingDistributor.distributor.toBase58(),
            data: req.body.balances,
          },
        },
      }),
    });

    res.json({
      msg: encode(tx.serialize({ requireAllSignatures: false })),
      ata: pendingDistributor.distributorATA.toBase58(),
      distributor: pendingDistributor.distributor.toBase58(),
      base: pendingDistributor.base.toBase58(),
    });
  } catch (err) {
    next(err);
  }
});

/**
 * Fetches a distributor from the DB and chain, returns details about it
 */
router.get("/drops/:distributor", async (req, res, next) => {
  try {
    const { dropzone_distributors_by_pk: query } = await chain("query")({
      dropzone_distributors_by_pk: [
        { id: req.params.distributor },
        { id: true },
      ],
    });

    const { data } = await getDistributor(query!.id);

    res.json({
      distributor: req.params.distributor,
      base: data.base,
      mint: data.mint,
      maxTotalClaim: new u64(data.maxTotalClaim).toNumber(),
      maxNumNodes: new u64(data.maxNumNodes).toNumber(),
      totalAmountClaimed: new u64(data.totalAmountClaimed).toNumber(),
      numNodesClaimed: new u64(data.numNodesClaimed).toNumber(),
    });
  } catch (err) {
    next(err);
  }
});

/**
 * Gets the status of a claimant's claim on a distributor
 */
router.get(
  "/drops/:distributor/claimants/:claimant",
  async (req, res, next) => {
    try {
      const { dropzone_distributors_by_pk } = await chain("query")({
        dropzone_distributors_by_pk: [
          { id: req.params.distributor },
          { id: true, data: [{ path: "$" }, true] },
        ],
      });

      if (!dropzone_distributors_by_pk) throw new Error("Not found");

      const query = dropzone_distributors_by_pk as {
        id: string;
        data: Array<{ account: string; amount: number }>;
      };

      const distributor = await getDistributor(query.id);

      const index = query.data.findIndex(
        (t) => t.account === req.params.claimant
      );

      if (index < 0) throw new Error("Claimant not found in drop");

      try {
        // claimed
        const claimStatus = await distributor.getClaimStatus(new u64(index));
        res.json({
          claimStatus,
        });
      } catch (err) {
        // not claimed
        res.json({ status: "unclaimed" });
      }
    } catch (err) {
      next(err);
    }
  }
);

router.get(
  "/drops/:distributor/claimants/:claimant/claim",
  async (req, res, next) => {
    try {
      const { dropzone_distributors_by_pk } = await chain("query")({
        dropzone_distributors_by_pk: [
          { id: req.params.distributor },
          { id: true, data: [{ path: "$" }, true] },
        ],
      });
      if (!dropzone_distributors_by_pk) throw new Error("Not found");
      const query = dropzone_distributors_by_pk as {
        id: string;
        data: Array<{ account: string; amount: number }>;
      };

      const provider = createProvider(new PublicKey(req.params.claimant));
      const distributor = await getDistributor(query.id, provider);

      const index = query.data.findIndex(
        (t) => t.account === req.params.claimant
      );

      if (index < 0) throw new Error("Claimant not found in drop");

      try {
        const claimStatus = await distributor.getClaimStatus(new u64(index));
        if (claimStatus.isClaimed) throw new Error("Already claimed");
      } catch (err: any) {
        if (err.message === "Already claimed") throw err;
      }

      const record = query.data[index];

      const claimant = new PublicKey(record.account);
      const amount = new u64(record.amount);

      console.log({
        index,
        claimant,
        amount,
      });

      const tree = new utils.BalanceTree(
        query.data.map((t) => ({
          amount: new u64(t.amount),
          account: new PublicKey(t.account),
        }))
      );

      const claim = await distributor.claim({
        index: new u64(index),
        amount,
        proof: tree.getProof(index, claimant, amount),
        claimant,
      });

      const tx = claim.build();
      const { blockhash, lastValidBlockHeight } =
        await provider.connection.getLatestBlockhash();
      tx.recentBlockhash = blockhash;
      tx.lastValidBlockHeight = lastValidBlockHeight;

      res.json({
        msg: encode(tx.serialize({ requireAllSignatures: false })),
      });
    } catch (err) {
      next(err);
    }
  }
);

// eslint-disable-next-line @typescript-eslint/no-unused-vars
router.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  res.status(500).json({
    error: err.message,
  });
});

export default router;

const createProvider = (publicKey = PublicKey.unique()) =>
  SolanaProvider.init({
    connection: new Connection("https://rpc-proxy.backpack.workers.dev"),
    wallet: emptyWallet(publicKey),
  });

const getDistributor = async (key: string, provider = createProvider()) => {
  const sdk = MerkleDistributorSDK.load({ provider });
  const distributor = await sdk.loadDistributor(new PublicKey(key));
  return distributor;
};

const chain = Chain(HASURA_URL, {
  headers: {
    Authorization: `Bearer ${JWT}`,
  },
});
