import useXNFT from '../../hooks/useXNFT';

export default function App() {
  const { xnft } = useXNFT();

  console.log(xnft);
  return <></>;
}
