import { useAnchorWallet } from '@solana/wallet-adapter-react';
import { getAllXNTs } from '../utils/xnft-client';
import { useEffect, useState } from 'react';

export default function useXNFTs() {
  const anchorWallet = useAnchorWallet();
  const [xnfts, setXNFTs] = useState<any[]>([]);

  useEffect(() => {
    async function getAllXNFTs() {
      const data = await getAllXNTs(anchorWallet);
      setXNFTs(data);
    }

    if (anchorWallet) getAllXNFTs();
  }, [anchorWallet]);

  return {
    xnfts,
    isLoading: xnfts.length === 0
  };
}
