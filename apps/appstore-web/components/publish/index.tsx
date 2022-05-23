import { memo, useReducer, useState } from 'react';
import dynamic from 'next/dynamic';
import { filesS3Uploader, metadataS3Uploader } from '../../utils/s3';
import { useAnchorWallet, useWallet } from '@solana/wallet-adapter-react';
import { uploadInitialState, uploadReducer } from '../../reducers/upload';
import { xNFTMint } from 'apps/appstore-web/utils/xnft-client';

const MintForm = dynamic(() => import('./mint-form'));

function Publish() {
  const { connected, publicKey } = useWallet();
  const anchorWallet = useAnchorWallet();
  const [uploadState, uploadDispatch] = useReducer(uploadReducer, uploadInitialState);

  // Upload metadata, bundle.js and images
  async function uploadBundle(e) {
    e.preventDefault();

    // Upload Data
    await filesS3Uploader(uploadState, uploadDispatch, publicKey!.toBase58());

    // Create and Upload metadata
    await metadataS3Uploader(uploadState, uploadDispatch, publicKey!.toBase58());

    // Mint xNFT
    await xNFTMint(uploadState, anchorWallet, publicKey);
  }

  return (
    <div className="flex flex-col items-center">
      <div className="flex max-w-2xl flex-col gap-5">
        <h1 className="text-center text-3xl font-bold leading-tight text-gray-50">
          Publish your app as an executable NFT
        </h1>

        <button
          type="button"
          className="mx-auto inline-flex w-32 cursor-no-drop
          items-center rounded-md border border-transparent
          bg-gray-700 px-4 py-2 font-medium tracking-wide
          text-gray-50 shadow-sm hover:bg-gray-500"
        >
          Learn more
        </button>

        {/* Tabs */}
        <div className="mt-4 flex flex-col gap-2">
          <form onSubmit={uploadBundle}>
            <>
              <MintForm uploadState={uploadState} uploadDispatch={uploadDispatch} />
              <button
                type="submit"
                className="mx-auto mt-10 flex justify-center rounded-lg
                  bg-gradient-to-br from-pink-500 to-orange-400 px-6 py-3
                  text-center text-sm font-medium tracking-wide text-white
                  shadow-lg shadow-red-800/80 hover:bg-gradient-to-bl
                  focus:outline-none focus:ring-4 focus:ring-pink-800"
              >
                Mint Executable NFT
              </button>
            </>
          </form>
        </div>
      </div>
    </div>
  );
}

export default memo(Publish);
