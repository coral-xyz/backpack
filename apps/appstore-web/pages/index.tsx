import { getAllXNTs } from '../utils/xnft-client';
import { useEffect, useState } from 'react';
import { useAnchorWallet } from '@solana/wallet-adapter-react';
import Gallery from '../components/gallery';

function Home() {
  const anchorWallet = useAnchorWallet();
  const [xfnts, setXNFTs] = useState<any>();

  useEffect(() => {
    async function getAllXNFTs() {
      const data = await getAllXNTs(anchorWallet);
      setXNFTs(data);
    }

    if (anchorWallet) getAllXNFTs();
  }, [anchorWallet]);

  console.log('nfts', xfnts);

  return (
    <div>
      <Gallery />
    </div>
  );
}

export default Home;
