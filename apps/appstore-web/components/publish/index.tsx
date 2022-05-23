import { memo, useReducer, useState } from 'react';
import dynamic from 'next/dynamic';
import { filesS3Uploader, metadataS3Uploader } from '../../utils/s3';
import { useAnchorWallet, useWallet } from '@solana/wallet-adapter-react';
import { uploadInitialState, uploadReducer } from '../../reducers/upload';
import { xNFTMint } from 'apps/appstore-web/utils/xnft-client';
import NotifyMinted from '../notifications/notify-minted';

const MintForm = dynamic(() => import('./mint-form'));

function Publish() {
  const { connected, publicKey } = useWallet();
  const anchorWallet = useAnchorWallet();
  const [uploadState, uploadDispatch] = useReducer(uploadReducer, uploadInitialState);
  const [loading, setLoading] = useState<boolean>(false);
  const [showMintedNotification, setShowMintedNotification] = useState<boolean>(false);

  // Upload metadata, bundle.js and images
  async function uploadBundle(e) {
    e.preventDefault();

    setLoading(true);

    // Upload Data
    await filesS3Uploader(uploadState, uploadDispatch, publicKey!.toBase58());

    // Create and Upload metadata
    const metadataUrl = await metadataS3Uploader(
      uploadState,
      uploadDispatch,
      publicKey!.toBase58()
    );

    // Mint xNFT
    await xNFTMint(uploadState, anchorWallet, publicKey, metadataUrl);

    setLoading(false);
    setShowMintedNotification(true);

    // TODO: If fails, send a notification
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
                disabled={!connected}
                className="relative mx-auto mt-10 flex w-60 items-center justify-center 
                rounded-lg bg-gradient-to-br from-pink-500 to-orange-400 px-3 py-3 text-center
                  text-sm font-medium tracking-wide text-gray-50
                  shadow-lg shadow-red-800/80 hover:bg-gradient-to-bl
                  focus:outline-none focus:ring-4 focus:ring-pink-800 disabled:opacity-40"
              >
                {loading && (
                  <svg
                    role="status"
                    className="absolute left-4 mr-2 inline h-6 w-6 animate-spin fill-blue-600 
                  text-gray-200 dark:text-gray-600"
                    viewBox="0 0 100 101"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      // eslint-disable-next-line max-len
                      d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                      fill="currentColor"
                    />
                    <path
                      // eslint-disable-next-line max-len
                      d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                      fill="currentFill"
                    />
                  </svg>
                )}
                Mint Executable NFT
              </button>
            </>
          </form>
        </div>
      </div>
      <NotifyMinted show={showMintedNotification} setShow={setShowMintedNotification} />
    </div>
  );
}

export default memo(Publish);
