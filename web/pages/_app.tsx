import Head from 'next/head';
import PlausibleProvider from 'next-plausible';

import '../styles/globals.css';
import MainLayout from '../components/layouts/MainLayout';

function MyApp({ Component, pageProps }) {
  return (
    <>
      <Head>
        <meta name="twitter:description" content="Built on coralOS, the xNFT operating system." />
        <meta name="twitter:title" content="Backpack - A home for your xNFT apps" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:image"
          content="https://www.backpack.app/_next/image?url=%2Fbrands%2Fbackpack-twitter.png&w=3840&q=75"
        />
        <title>Backpack</title>
      </Head>

      <PlausibleProvider domain="backpack.app" trackOutboundLinks={true}>
        <MainLayout>
          <Component {...pageProps} />
        </MainLayout>
      </PlausibleProvider>
    </>
  );
}

export default MyApp;
