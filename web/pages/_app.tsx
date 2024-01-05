import type { AppProps } from 'next/app';
import PlausibleProvider from 'next-plausible';

import CoralFooter from '../components/CoralFooter';
import Nav from '../components/Nav';
import Metadata from '../components/Metadata';

import '../styles/globals.css';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Metadata />
      <PlausibleProvider domain="backpack.app" trackOutboundLinks={true}>
        <div className="bg-zinc-900">
          <div
            className="justify-betwee mx-auto flex min-h-screen
          max-w-7xl flex-col"
          >
            <div className="pb-10">
              <Nav />
            </div>

            <div className="mb-auto px-5 py-10 md:px-10">
              <Component {...pageProps} />
            </div>

            <div className="items-end pb-8">
              <CoralFooter />
            </div>
          </div>
        </div>
      </PlausibleProvider>
    </>
  );
}

export default MyApp;
