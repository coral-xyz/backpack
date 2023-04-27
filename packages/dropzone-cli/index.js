const {
  SolanaProvider,
  TransactionEnvelope,
} = require("@saberhq/solana-contrib");
const { SPLToken, TOKEN_PROGRAM_ID } = require("@saberhq/token-utils");
const axios = require("axios");
const { decode, encode } = require("bs58");
const { Command } = require("commander");
const { AnchorProvider, setProvider } = require("@coral-xyz/anchor");
const { PublicKey, Transaction } = require("@solana/web3.js");
const { homedir } = require("os");
const { join } = require("path");

const { name, version, description } = require("./package.json");

const program = new Command();

process.env.ANCHOR_PROVIDER_URL ||= "https://solana-rpc.xnfts.dev";
process.env.ANCHOR_WALLET ||= join(homedir(), "wallet.json");

const anchorProvider = AnchorProvider.env();
setProvider(anchorProvider);
const provider = SolanaProvider.init(anchorProvider);
const { connection, wallet } = anchorProvider;

program.name(name).description(description).version(version);

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
  .action(async (options) => {
    const url = [
      options.local
        ? "http://localhost:8080"
        : "https://backpack-api.xnfts.dev",
      "dropzone/drops",
    ].join("/");

    const {
      data: { msg, distributor, ata },
    } = await axios.post(url, {
      creator: anchorProvider.publicKey.toBase58(),
      mint: options.mint,
      balances: JSON.parse(options.balances),
    });

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
  });

program.parse();
