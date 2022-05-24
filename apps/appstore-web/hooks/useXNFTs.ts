import { useAnchorWallet } from '@solana/wallet-adapter-react';
import { getAllXNFTs } from '../utils/xnft-client';
import { useEffect, useState } from 'react';
import { Metadata } from '@metaplex-foundation/mpl-token-metadata';

export default function useXNFTs() {
  const anchorWallet = useAnchorWallet();
  const [xnfts, setXNFTs] = useState<Metadata[]>([]);

  useEffect(() => {
    async function get() {
      const data = await getAllXNFTs(anchorWallet);
      setXNFTs(data);
    }

    if (anchorWallet) get();
  }, [anchorWallet]);

  return {
    xnfts,
    isLoading: xnfts.length === 0
  };
}
