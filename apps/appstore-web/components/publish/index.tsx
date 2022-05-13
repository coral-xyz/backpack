import { memo, useReducer, useState } from 'react';
import dynamic from 'next/dynamic';
import { ArrowSmRightIcon } from '@heroicons/react/outline';
import useAuth from '../../hooks/useAuth';
import { filesS3Uploader, metadataS3Uploader } from '../../utils/s3';
import { clusterApiUrl, Connection } from '@solana/web3.js';
import { Metaplex, walletAdapterIdentity } from '@metaplex-foundation/js-next';
import { useWallet } from '@solana/wallet-adapter-react';

const Tabs = dynamic(() => import('./tabs'));
const UploadApp = dynamic(() => import('./upload-app'));
const MintApp = dynamic(() => import('./mint-app'));

function uploadReducer(state, action) {
  switch (action.type) {
    case 'field': {
      return {
        ...state,
        [action.field]: action.value
      };
    }
    case 'file': {
      return {
        ...state,
        [action.field]: action.value
      };
    }
    case 's3': {
      return {
        ...state,
        [action.field]: action.value
      };
    }
    case 'reset': {
      return uploadInitialState;
    }
  }
}

const uploadInitialState = {
  title: '',
  description: '',
  website: '',
  discord: '',
  twitter: '',
  bundle: {},
  icon: {},
  screenshots: {}
};

function Publish() {
  const { wallet, connected } = useWallet();
  const { session, status } = useAuth(true);
  const [selectedTab, setSelectedTab] = useState('Upload App');
  const [uploadState, uploadDispatch] = useReducer(uploadReducer, uploadInitialState);

  async function uploadBundle(e) {
    e.preventDefault();

    // Upload Data to S3
    await filesS3Uploader(uploadState, uploadDispatch, session);

    await metadataS3Uploader(uploadState, uploadDispatch, session);

    // uploadDispatch({ type: "reset" });
    setSelectedTab('Review & Mint');
  }

  async function mintApp(e) {
    e.preventDefault();

    const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');
    const metaplex = Metaplex.make(connection);

    metaplex.use(walletAdapterIdentity(wallet.adapter));

    const transaction = await metaplex.nfts().create({
      name: uploadState.title,
      uri: uploadState.s3UrlMetadata,
      isMutable: true
    });

    uploadDispatch({
      type: 'field',
      field: 'transaction',
      value: `https://explorer.solana.com/tx/${transaction.transactionId}?cluster=devnet`
    });
  }

  return (
    <div className="flex flex-col items-center">
      <div className="flex max-w-2xl flex-col gap-5">
        <h1 className="text-3xl font-bold leading-tight text-gray-50">
          Publish your app as an executable NFT
        </h1>

        <button
          type="button"
          className="mx-auto inline-flex w-32 cursor-no-drop items-center rounded-md border border-transparent bg-gray-700 px-4 py-2 font-medium tracking-wide text-gray-50 shadow-sm hover:bg-gray-500"
        >
          Learn more
        </button>

        {/* Tabs */}
        <div className="mt-10 flex flex-col gap-2">
          <Tabs selected={selectedTab} setSelected={setSelectedTab} />
          <form onSubmit={selectedTab === 'Upload App' ? uploadBundle : mintApp}>
            {selectedTab === 'Upload App' && (
              <>
                <UploadApp uploadState={uploadState} uploadDispatch={uploadDispatch} />
                <button
                  type="submit"
                  className="mx-auto mt-10 flex w-32 justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 font-medium tracking-wide text-gray-50 shadow-sm hover:bg-indigo-700"
                  disabled={status !== 'authenticated'}
                >
                  Next <ArrowSmRightIcon className="h-6 w-6" />
                </button>
              </>
            )}
            {selectedTab === 'Review & Mint' && (
              <>
                <MintApp uploadState={uploadState} uploadDispatch={uploadDispatch} />
                <button
                  type="submit"
                  className="mx-auto mt-10 flex justify-center rounded-lg bg-gradient-to-br from-pink-500 to-orange-400 px-6 py-3 text-center text-sm font-medium tracking-wide text-white shadow-lg shadow-red-800/80 hover:bg-gradient-to-bl focus:outline-none focus:ring-4 focus:ring-pink-800"
                >
                  Mint Executable NFT
                </button>
              </>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}

export default memo(Publish);
