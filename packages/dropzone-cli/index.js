const { AnchorProvider, setProvider } = require("@coral-xyz/anchor");
const {
  SolanaProvider,
  TransactionEnvelope,
  sleep,
} = require("@saberhq/solana-contrib");
const { SPLToken, TOKEN_PROGRAM_ID } = require("@saberhq/token-utils");
const {
  AddressLookupTableProgram,
  PublicKey,
  Transaction,
} = require("@solana/web3.js");
const axios = require("axios");
const { decode, encode } = require("bs58");
const { Command } = require("commander");
const { homedir } = require("os");
const { join } = require("path");

process.env.ANCHOR_PROVIDER_URL ||= "https://solana-rpc.xnfts.dev";
process.env.ANCHOR_WALLET ||= join(homedir(), "wallet.json");
process.env.PROGRAM ||= "DRoPZqPL5hjVsDyjokqKqMrW6DLzhGimjowQ9XSZHvrF";

const anchorProvider = AnchorProvider.env();
setProvider(anchorProvider);
const provider = SolanaProvider.init(anchorProvider);
const { connection, wallet } = anchorProvider;

const program = new Command();
program
  .command("create")
  .description("Creates a dropzone drop")
  .requiredOption("-m, --mint <string>", "mint public key string")
  .requiredOption(
    "-b, --balances <string>",
    `object of usernames and balances to be dropped e.g. '{ "foo": 123, "bar": 456 }'`
  )
  .option("-l, --local", "use backpack-api running on localhost")
  .option(
    "-f, --fund",
    "fund the distributor account with SUM(balances) of the mint"
  )
  .option(
    "-p, --publish",
    "publish the distributor so it's immediately visible in the UI"
  )
  .action(async (options) => {
    const url = [
      options.local
        ? "http://localhost:8080"
        : "https://backpack-api.xnfts.dev",
      "dropzone/drops",
    ].join("/");

    const {
      data: { msg, distributor, ata, secret },
    } = await axios.post(url, {
      creator: anchorProvider.publicKey.toBase58(),
      mint: options.mint,
      balances: JSON.parse(options.balances),
    });

    const lookupTable = await createLookupTable(ata, distributor, wallet);

    const r = await axios.patch(
      `${url}/${distributor}`,
      {
        lookup_table_public_key: lookupTable,
      },
      { headers: { Authorization: `Bearer ${secret}` } }
    );
    console.log({ res: r.data, lookup_table_public_key: lookupTable, secret });

    const tx = Transaction.from(decode(msg));

    await wallet.signTransaction(tx);

    const signature = await connection.sendRawTransaction(tx.serialize());

    const { blockhash, lastValidBlockHeight } =
      await connection.getLatestBlockhash();

    await connection.confirmTransaction({
      blockhash,
      lastValidBlockHeight,
      signature,
    });

    console.log({
      transaction: `https://explorer.solana.com/tx/${encode(
        tx.signatures[0].signature
      )}`,
      distributor: {
        address: distributor,
        account: `https://explorer.solana.com/account/${distributor}`,
      },
      tokenAccount: {
        address: ata,
        account: `https://explorer.solana.com/account/${ata}`,
      },
    });

    if (options.fund) {
      const total = Object.values(JSON.parse(options.balances)).reduce(
        (acc, curr) => acc + curr,
        0
      );

      console.log(`minting ${total} ${options.mint} to ${ata}...`);

      const ix = SPLToken.createMintToInstruction(
        TOKEN_PROGRAM_ID,
        new PublicKey(options.mint),
        new PublicKey(ata),
        wallet.publicKey,
        [],
        total
      );
      const tx = new TransactionEnvelope(provider, [ix]);
      const { signature } = await tx.confirm();

      console.log({
        funding: {
          signature,
          transaction: `https://explorer.solana.com/tx/${signature}`,
        },
      });
    }

    if (options.publish) {
      await axios.patch(
        `${url}/${distributor}`,
        {
          published_at: new Date().toISOString(),
        },
        { headers: { Authorization: `Bearer ${secret}` } }
      );
      console.log("published!");
    }
  });

const createLookupTable = async (ata, distributor, wallet) => {
  console.log("creating lookup table...");

  const recentSlot = await connection.getSlot();

  await sleep(1000);

  const [lookupTableInst, lookupTableAddress] =
    AddressLookupTableProgram.createLookupTable({
      authority: wallet.publicKey,
      payer: wallet.publicKey,
      recentSlot,
    });

  const extendInstruction = AddressLookupTableProgram.extendLookupTable({
    lookupTable: lookupTableAddress,
    authority: wallet.publicKey,
    payer: wallet.publicKey,
    addresses: [
      // wallet.publicKey,
      new PublicKey(process.env.PROGRAM),
      new PublicKey("11111111111111111111111111111111"),
      new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"),
      new PublicKey(ata),
      new PublicKey(distributor),
    ],
  });

  const tx = new Transaction();
  tx.add(lookupTableInst);
  tx.add(extendInstruction);
  tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
  tx.feePayer = wallet.publicKey;
  await wallet.signTransaction(tx);

  const signature = await connection.sendRawTransaction(tx.serialize());
  const block = await connection.getLatestBlockhash();
  await connection.confirmTransaction({
    blockhash: block.blockhash,
    lastValidBlockHeight: block.lastValidBlockHeight,
    signature,
  });
  const lookupTableAccount = (
    await connection.getAddressLookupTable(lookupTableAddress)
  ).value;
  console.log("Table address from cluster:", lookupTableAccount.key.toBase58());
  for (let i = 0; i < lookupTableAccount.state.addresses.length; i++) {
    const address = lookupTableAccount.state.addresses[i];
    console.log(i, address.toBase58());
  }
  return lookupTableAccount.key.toBase58();
};

program.parse();
