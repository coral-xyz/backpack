import "../styles/globals.css";
import type { AppProps } from "next/app";
import PlausibleProvider from "next-plausible";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    // TODO: domain
    <PlausibleProvider domain="domain" trackOutboundLinks={true}>
      <Component {...pageProps} />
    </PlausibleProvider>
  );
}
export default MyApp;
