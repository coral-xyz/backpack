import { clusterApiUrl, Connection, PublicKey } from '@solana/web3.js';
import { Program, AnchorProvider } from '@project-serum/anchor';
import { Xnft, IDL } from '../programs/xnft/types';
import BN from 'bn.js';
import xnftIdl from '../programs/xnft/idl.json';
import { Metadata } from '@metaplex-foundation/mpl-token-metadata';
import fetch from './fetcher';

// TODO:
const connection = new Connection('http://127.0.0.1:8899');

// xNFT Program ID
const programID = new PublicKey(xnftIdl.metadata.address);

/**
 * Mint a xNFT
 * @param anchorWallet
 * @param publicKey
 */
export async function xNFTMint(data: any, anchorWallet: any, publicKey: any, medataUrl: string) {
  const provider = new AnchorProvider(connection, anchorWallet, { commitment: 'confirmed' });
  const program = new Program<Xnft>(IDL, programID, provider);

  const installPrice = new BN(0); // TODO:
  const seller_fee_basis_points = 1; // TODO:
  const name = data.title;
  const symbol = data.title.slice(0, 3);
  const uri = medataUrl;

  try {
    const tx = await program.methods
      .createXnft(name, symbol, uri, seller_fee_basis_points, installPrice, publicKey)
      .accounts({
        metadataProgram: new PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s')
      });

    await tx.rpc();

    console.log('Success minting xnft', tx);
  } catch (error) {
    console.log('Error minting xnft', error);
  }
}

/**
 * Get all xNFTs
 */
export async function getAllXNTs(anchorWallet: any): Promise<Array<any>> {
  const provider = new AnchorProvider(connection, anchorWallet, { commitment: 'confirmed' });
  const program = new Program<Xnft>(IDL, programID, provider);
  const response = [];

  const data = await program.account.xnft.all();

  for await (const item of data) {
    // Find metadata account data
    const metadataAccount = await Metadata.fromAccountAddress(
      program.provider.connection,
      item.account.masterMetadata
    );

    // Find Metadata data
    const metadata = await fetch(metadataAccount.data.uri);

    metadataAccount.data['metadata'] = metadata;

    response.push(metadataAccount);
  }

  return response;
}
