import Head from 'next/head';

const Metadata = ({ pageName }: { pageName?: string }) => {
  return (
    <>
      <Head>
        <meta name="twitter:title" content="Backpack - A home for your xNFT apps" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:image"
          content="https://www.backpack.app/_next/image?url=%2Fbrands%2Fbackpack-twitter.png&w=3840&q=75"
        />
        <meta name="apple-itunes-app" content="app-id=6445964121" />
        <title>{`Backpack${pageName ? ` | ${pageName}` : ''}`}</title>
      </Head>
    </>
  );
};

export default Metadata;
