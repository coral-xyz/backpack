import '../styles/globals.css';
import type { AppProps } from 'next/app';
import PlausibleProvider from 'next-plausible';
import Head from 'next/head';
import { ContextProvider } from '../context/ContextProvider';
import Nav from '../components/nav';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>Coral App Store</title>
      </Head>
      {/*// TODO: domain*/}
      <PlausibleProvider domain="domain" trackOutboundLinks={true}>
        <ContextProvider>
          <Nav />

          <div className="min-h-screen bg-gray-800 px-5 py-10">
            <Component {...pageProps} />
          </div>
        </ContextProvider>
      </PlausibleProvider>
    </>
  );
}
export default MyApp;
