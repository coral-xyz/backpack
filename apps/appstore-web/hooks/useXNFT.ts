import { useAnchorWallet } from '@solana/wallet-adapter-react';
import { getXNFT } from '../utils/xnft-client';
import { useEffect, useState } from 'react';
import { Metadata } from '@metaplex-foundation/mpl-token-metadata';
import { useRouter } from 'next/router';
import { PublicKey } from '@solana/web3.js';

export default function useXNFT() {
  const router = useRouter();
  const anchorWallet = useAnchorWallet();
  const [xnft, setXNFT] = useState<Metadata>();

  const { app } = router.query;

  useEffect(() => {
    async function get() {
      const masterMetadataPK = new PublicKey(app);

      const data = await getXNFT(anchorWallet, masterMetadataPK);
      setXNFT(data);
    }

    if (anchorWallet && app) get();
  }, [anchorWallet, app]);

  return {
    xnft,
    isLoading: !xnft
  };
}
