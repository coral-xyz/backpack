import Gallery from '../components/gallery';
import useXNFTs from '../hooks/useXNFTs';

function Home() {
  const { xnfts, loading } = useXNFTs();

  if (loading) return <></>;

  return (
    <div>
      <Gallery xnfts={xnfts} />
    </div>
  );
}

export default Home;
