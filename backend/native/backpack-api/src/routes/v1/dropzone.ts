import { emptyWallet } from "@cardinal/common";
import { MerkleDistributorSDK, utils } from "@coral-xyz/merkle-distributor";
import type { order_by } from "@coral-xyz/zeus";
import { Chain } from "@coral-xyz/zeus";
import type { PublicKeyString } from "@metaplex-foundation/js";
import { SignerWallet, SolanaProvider } from "@saberhq/solana-contrib";
import { u64 } from "@saberhq/token-utils";
import { Connection, PublicKey, TransactionMessage } from "@solana/web3.js";
import { encode } from "bs58";
import cors from "cors";
import type { NextFunction, Request, Response } from "express";
import express from "express";
import { jwtVerify } from "jose";

import { DROPZONE_PERMITTED_AUTHORITIES, HASURA_URL, JWT } from "../../config";

const RPC_URL = "https://solana-rpc.xnfts.dev";
const XNFT_PUBLIC_KEY =
  process.env.NODE_ENV === "production"
    ? "CVkbt7dscJdjAJFF2uKrtin6ve9M8DA4gsUccAjePUHH"
    : "11111111111111111111111111111111";

const router = express.Router();
router.use(cors({ origin: "*" }));

type DropzoneData = Record<PublicKeyString, [number, number, string]>;

/**
 * GET /drops
 * gets all claimed and unclaimed drops for a claimant
 */
router.get("/drops", extractClaimantPublicKey, async (_req, res, next) => {
  try {
    const {
      auth_users: [user],
      dropzone_claims,
    } = await getDropzoneClaimsByClaimant(res.locals.claimantPublicKey);

    const claimed = dropzone_claims
      .filter((c) => c.transaction_signature)
      .sort((a, b) =>
        String(b.claimed_at || "").localeCompare(String(a.claimed_at || ""))
      );

    const _unclaimed = dropzone_claims.filter(
      (c) => !c.transaction_signature && c.distributor.lookup_table_public_key
    ) as Array<any>;

    const unclaimed = (
      await Promise.all(
        _unclaimed.map(async (c) => {
          let status;
          try {
            status = await (
              await getDistributor(c.distributor.public_key)
            ).getClaimStatus(new u64(c.ordinal));
          } catch (err) {
            console.error(err);
          }
          return { ...c, status };
        })
      )
    ).filter((c) => !c.status);

    const unopened = await Promise.all(
      chunk(unclaimed, 8).map(async (claims) => {
        return claims.reduce(
          (a, c) => {
            a.mints[c.distributor.mint_public_key] ??= 0;
            a.mints[c.distributor.mint_public_key] += Number(c.amount);
            if (c.created_at > a.created_at) a.created_at = c.created_at;
            return a;
          },
          {
            id: claims
              .map((c) => c.distributor.public_key)
              .sort()
              .join(":"),
            mints: {},
            created_at: "",
            // claims,
          }
        );
      })
    );

    const drops = claimed.reduce((acc, curr) => {
      acc[curr.transaction_signature!] ??= {
        claims: [],
      };
      acc[curr.transaction_signature!].claims.push(curr);
      return acc;
    }, {} as Record<any, { claims: any[] }>);

    res.json({
      ...user,
      unopened,
      opened: Object.entries(drops).reduce(
        (acc, [k, v]) =>
          acc.concat({
            ...v,
            transaction_signature: k,
            claimed_at: v.claims.sort((a, b) => a.claimed_at > b.claimed_at)[0]
              .claimed_at,
          }),
        [] as any[]
      ),
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
});

/**
 * POST /drops/claim
 * returns transaction that needs to be signed to claim a drop
 */
router.post(
  "/drops/claim",
  extractClaimantPublicKey,
  async (req, res, next) => {
    try {
      const { dropzone_claims } = await getDropzoneClaimsByClaimant(
        res.locals.claimantPublicKey,
        req.body.ids
      );
      const msg = await buildClaimsTransaction(
        new PublicKey(res.locals.claimantPublicKey),
        dropzone_claims.map((c) => ({
          amount: Number(c.amount),
          ordinal: c.ordinal,
          data: c.distributor.data as DropzoneData,
          distributorPublicKey: c.distributor.public_key,
          lookupTablePublicKey: c.distributor.lookup_table_public_key!,
        }))
      );
      res.json({ msg });
    } catch (err) {
      next(err);
    }
  }
);

/**
 * PATCH /drops/claim
 * set the transaction signature on a claim
 */
router.patch(
  "/drops/claim",
  extractClaimantPublicKey,
  async (req, res, next) => {
    try {
      const claimed_at = await (async () => {
        try {
          const connection = new Connection(RPC_URL);
          const tx = await connection.getTransaction(
            req.body.transaction_signature,
            {
              commitment: "confirmed",
              maxSupportedTransactionVersion: 0,
            }
          );
          if (tx?.blockTime && tx.blockTime > 0) {
            return new Date(tx!.blockTime! * 1000).toISOString();
          }
        } catch (err) {
          console.error(err);
        }
      })();

      const { update_dropzone_claims_many } = await chain("mutation")(
        {
          update_dropzone_claims_many: [
            {
              updates: [
                {
                  _set: {
                    transaction_signature: req.body.transaction_signature,
                    claimed_at,
                  },
                  where: {
                    transaction_signature: { _is_null: true },
                    distributor: { public_key: { _in: req.body.ids } },
                    claimant_public_key: { _eq: res.locals.claimantPublicKey },
                  },
                },
              ],
            },
            {
              affected_rows: true,
            },
          ],
        },
        {
          operationName: "updateTransactionSignature",
        }
      );
      res.json({ update_dropzone_claims_many });
    } catch (err) {
      next(err);
    }
  }
);

// Admin methods

/**
 * POST /drops
 * create drop, stores data in db
 */
router.post("/drops", async (req, res, next) => {
  try {
    if (
      DROPZONE_PERMITTED_AUTHORITIES.length > 0 &&
      !DROPZONE_PERMITTED_AUTHORITIES.includes(req.body.creator)
    ) {
      throw new Error("Unauthorized");
    }

    const usernames = Object.keys(req.body.balances);

    const { auth_public_keys } = await chain("query")(
      {
        auth_public_keys: [
          {
            where: {
              blockchain: { _eq: "solana" },
              is_primary: { _eq: true },
              user: { username: { _in: usernames } },
            },
          },
          {
            public_key: true,
            user: { id: true, username: true },
          },
        ],
      },
      {
        operationName: "getUserPublicKeysToCreateDropzoneDistributor",
      }
    );

    if (auth_public_keys.length < usernames.length) {
      throw new Error("Some usernames were not found");
    }

    const data = auth_public_keys.reduce((acc, curr, index) => {
      const username = curr.user!.username as string;
      acc[curr.public_key] = [req.body.balances[username], index, username];
      return acc;
    }, {} as DropzoneData);

    const provider = createProvider(new PublicKey(req.body.creator));
    const sdk = MerkleDistributorSDK.load({ provider });

    const _tree = Object.entries(data).reduce(
      (acc, [account, [amount]]) => acc.concat({ account, amount }),
      [] as { account: PublicKeyString; amount: number }[]
    );

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

    await new SignerWallet(pendingDistributor.tx.signers[0]).signTransaction(
      tx
    );

    // Can't seem to use zeus here because of JSONB field, explanation below
    // https://gist.github.com/wentokay/fc0f6891bab6404ad0bcea7761696dd7
    const r = await fetch(HASURA_URL, {
      method: "POST",
      headers: { Authorization: `Bearer ${JWT}` },
      body: JSON.stringify({
        query: `
          mutation createDropzoneDistributor($object:dropzone_distributors_insert_input!) {
            insert_dropzone_distributors_one(object: $object) { id secret }
          }`,
        variables: {
          object: {
            data,
            public_key: pendingDistributor.distributor.toBase58(),
            mint_public_key: req.body.mint,
            // id
            // category_id
            // transaction_signature
            // published_at
            // created_at
          },
        },
      }),
    });

    const body = await r.json();
    console.log(body);
    const { insert_dropzone_distributors_one } = body.data;

    const claims = auth_public_keys.map((pk, index) => ({
      distributor_id: insert_dropzone_distributors_one.id,
      claimant_id: pk.user!.id,
      claimant_public_key: pk.public_key,
      ordinal: index,
      amount: req.body.balances[pk.user!.username as string],
    }));

    await chain("mutation")(
      {
        insert_dropzone_claims: [{ objects: claims }, { affected_rows: true }],
      },
      { operationName: "insertDropzoneClaims" }
    );

    const responseObject = {
      msg: encode(tx.serialize({ requireAllSignatures: false })),
      ata: pendingDistributor.distributorATA.toBase58(),
      distributor: pendingDistributor.distributor.toBase58(),
      secret: insert_dropzone_distributors_one.secret,
    };

    res.status(201).json(responseObject);
  } catch (err) {
    next(err);
  }
});

/**
 * PATCH /drops/:id
 * update drop
 */
router.patch("/drops/:id", async (req, res, next) => {
  try {
    await chain("mutation")(
      {
        update_dropzone_distributors: [
          {
            where: {
              public_key: { _eq: req.params.id },
              secret: { _eq: getBearerToken(req) },
            },
            _set: {
              lookup_table_public_key: req.body.lookup_table_public_key,
              published_at:
                req.body.published_at || req.body.published_at === null
                  ? req.body.published_at
                  : undefined,
            },
          },
          { affected_rows: true },
        ],
      },
      {
        operationName: "updateDropzoneDistributor",
      }
    );
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

// TODO: ee576fdf577c8ba8574788790edb11ac

// eslint-disable-next-line @typescript-eslint/no-unused-vars
router.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  res.status(500).json({
    error: err.message,
  });
});

export default router;

const chain = Chain(HASURA_URL, {
  headers: {
    Authorization: `Bearer ${JWT}`,
  },
});

const getDropzoneClaimsByClaimant = (
  public_key: PublicKeyString,
  ids = undefined
) =>
  chain("query")(
    {
      auth_users: [
        {
          limit: 1,
          where: {
            // id: { _eq: req.id },
            public_keys: {
              public_key: { _eq: public_key },
              is_primary: { _eq: true },
              blockchain: { _eq: "solana" },
            },
          },
        },
        {
          username: true,
          referred_users: [
            {
              order_by: [{ created_at: "desc" as order_by.desc }],
            },
            { username: true, created_at: true },
          ],
        },
      ],
      dropzone_claims: [
        {
          where: {
            claimant_public_key: { _eq: public_key },
            distributor: {
              public_key: { _in: ids },
              published_at: { _lte: "NOW()" },
            },
          },
        },
        {
          distributor: {
            public_key: true,
            mint_public_key: true,
            lookup_table_public_key: true,
            data: [{}, true],
          },
          ordinal: true,
          amount: true,
          created_at: true,
          transaction_signature: true,
          claimed_at: true,
        },
      ],
    },
    {
      operationName: "getDropzoneClaimsByClaimant",
    }
  );

const createProvider = (publicKey = PublicKey.unique()) =>
  SolanaProvider.init({
    connection: new Connection(RPC_URL),
    wallet: emptyWallet(publicKey),
  });

const getDistributor = async (key: string, provider = createProvider()) => {
  const sdk = MerkleDistributorSDK.load({ provider });
  const distributor = await sdk.loadDistributor(new PublicKey(key));
  return distributor;
};

const buildClaimsTransaction = async (
  claimant: PublicKey,
  claims: ReadonlyArray<{
    amount: number;
    ordinal: number;
    distributorPublicKey: PublicKeyString;
    lookupTablePublicKey: PublicKeyString;
    data: DropzoneData;
  }>
) => {
  const connection = new Connection(RPC_URL);

  const groups = await Promise.all(
    claims.map(async (claim) => {
      const dist = await getDistributor(
        claim.distributorPublicKey,
        createProvider(claimant)
      );
      // try {
      //   // const claimStatus = await distributor.getClaimStatus(tryBN(0));
      //   const claimStatus = await distributor.getClaimStatus(new u64(0));
      //   console.log(claimStatus);
      // } catch (err) {}
      const amount = new u64(claim.amount);
      const tree = new utils.BalanceTree(
        Object.entries(claim.data)
          .sort(([_1, [_2, a]], [_3, [_4, b]]) => a - b)
          .map(([account, [amount]]) => ({
            account: new PublicKey(account),
            amount: new u64(amount),
          }))
      );
      const c = await dist.claim({
        index: new u64(claim.ordinal),
        amount,
        proof: tree.getProof(claim.ordinal, claimant, amount),
        claimant,
      });
      const { instructions } = c;
      const lookupTableAccount = (
        await connection.getAddressLookupTable(
          new PublicKey(claim.lookupTablePublicKey)
        )
      ).value!;
      return {
        instructions,
        lookupTableAccount,
      };
    })
  );

  const message = new TransactionMessage({
    payerKey: claimant,
    recentBlockhash: (await connection.getLatestBlockhash()).blockhash,
    instructions: groups.flatMap((g) => g.instructions),
  }).compileToV0Message(groups.map((g) => g.lookupTableAccount));

  return encode(message.serialize());
};

async function extractClaimantPublicKey(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const publicKey = new PublicKey(
      req.query.public_key as PublicKeyString
    ).toString();

    const {
      auth_xnft_secrets: [{ secret }],
    } = await chain("query")(
      {
        auth_xnft_secrets: [
          {
            where: { xnft_id: { _eq: XNFT_PUBLIC_KEY } },
            limit: 1,
          },
          { secret: true },
        ],
      },
      { operationName: "getXnftSecret" }
    );

    const userId = await (async () => {
      try {
        const jwt = getBearerToken(req);
        const {
          payload: { uuid },
        } = await jwtVerify(jwt, new TextEncoder().encode(secret));
        return uuid;
      } catch (err) {
        throw new Error("Invalid or missing JWT");
      }
    })();

    const { auth_public_keys } = await chain("query")(
      {
        auth_public_keys: [
          {
            where: {
              user_id: { _eq: userId },
              blockchain: { _eq: "solana" },
              is_primary: { _eq: true },
              public_key: { _eq: publicKey },
            },
            limit: 1,
          },
          { user_id: true },
        ],
      },
      { operationName: "getPrimaryPublicKeyForUser" }
    );
    if (auth_public_keys.length !== 1) throw new Error("Invalid public key");

    res.locals.claimantPublicKey = publicKey;
  } catch (err) {
    next(err);
  }
  next();
}

const chunk = <T>(arr: T[], size: number): T[][] =>
  [...Array(Math.ceil(arr.length / size))].map((_, i) =>
    arr.slice(size * i, size + size * i)
  );

const getBearerToken = (req: Request) =>
  String(req.headers.authorization?.replace("Bearer ", ""));
