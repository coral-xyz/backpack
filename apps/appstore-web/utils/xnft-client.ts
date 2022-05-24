import { Connection, PublicKey } from '@solana/web3.js';
import { AnchorProvider, Program } from '@project-serum/anchor';
import { IDL, Xnft } from '../programs/xnft/types';
import BN from 'bn.js';
import xnftIdl from '../programs/xnft/idl.json';
import { Metadata } from '@metaplex-foundation/mpl-token-metadata';
import fetch from './fetcher';
import { AnchorWallet } from '@solana/wallet-adapter-react';

const connection = new Connection(process.env.NEXT_PUBLIC_CONNECTION);

// xNFT Program ID
const programID = new PublicKey(xnftIdl.metadata.address);

/**
 * Mint a xNFT
 * @param data
 * @param anchorWallet
 * @param publicKey
 * @param medataUrl
 */
export async function xNFTMint(
  data: any,
  anchorWallet: AnchorWallet,
  publicKey: PublicKey,
  medataUrl: string
) {
  const provider = new AnchorProvider(connection, anchorWallet, {});
  const program = new Program<Xnft>(IDL, programID, provider);

  const installPrice = new BN(0); // TODO:
  const seller_fee_basis_points = 1; // TODO:
  const name = data.title;
  const symbol = data.title.slice(0, 3);

  try {
    const tx = await program.methods
      .createXnft(name, symbol, medataUrl, seller_fee_basis_points, installPrice, publicKey)
      .accounts({
        metadataProgram: new PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s')
      });

    const signature = await tx.rpc();
    console.log('Success minting xnft', signature);
  } catch (error) {
    console.log('Error minting xnft', error);
  }
}

/**
 * Get All xNFTs
 * @param anchorWallet
 * @returns xNFTs
 */
export async function getAllXNFTs(anchorWallet: AnchorWallet): Promise<Array<any>> {
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

    const xnft = {
      accounts: item.account,
      metadataAccount,
      metadata
    };

    response.push(xnft);
  }

  return response;
}

/**
 * Get xNFT
 * @param anchorWallet
 * @param masterMetadataPK
 * @returns xNFT Metadata
 */
export async function getXNFT(
  anchorWallet: AnchorWallet,
  masterMetadataPK: PublicKey
): Promise<any> {
  const provider = new AnchorProvider(connection, anchorWallet, { commitment: 'confirmed' });
  const program = new Program<Xnft>(IDL, programID, provider);

  let xnft = {};

  try {
    // Find metadata account data
    const metadataAccount = await Metadata.fromAccountAddress(
      program.provider.connection,
      masterMetadataPK
    );

    // Find Metadata data
    const metadata = await fetch(metadataAccount.data.uri);

    xnft = {
      metadataAccount,
      metadata
    };
  } catch (error) {
    console.error('Error finding xNFT', error);
  }

  return xnft;
}
