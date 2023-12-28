import { Suspense, lazy } from 'react';

const Newsletter = lazy(() => import('../components/Newsletter'));
const Partners = lazy(() => import('../components/Partners'));

export default function About() {
  return (
    <>
      <div className="mx-auto mb-28 flex flex-col items-center gap-16">
        <h1
          className="mt-4 text-4xl font-extrabold tracking-tight
                  text-zinc-50 sm:mt-5 sm:text-6xl lg:mt-6 xl:text-6xl"
        >
          Welcome to Backpack
        </h1>

        <div className="flex max-w-lg flex-col gap-4 text-center text-zinc-400">
          <p className="text-zinc-400">
            Backpack is brought to you by{' '}
            <a
              className="text-teal-500"
              href="https://www.coral.community/"
              target="_blank"
              rel="noreferrer"
            >
              Coral
            </a>
            ; the team behind the{' '}
            <a
              className="text-teal-500"
              target="_blank"
              rel="noreferrer"
              href="https://www.coral.community/post/wtf-are-xnfts"
            >
              xNFTs.
            </a>
          </p>
          <p>
            We’re building products, protocols and primitives for Web3. If that interests you,{' '}
            <a className="text-teal-500" href="mailto:admin+jobs@200ms.io">
              email us.
            </a>
          </p>
          <p>
            Have questions?{' '}
            <a
              className="text-teal-500"
              target="_blank"
              rel="noreferrer"
              href="https://twitter.com/xNFT_Backpack"
            >
              Follow Backpack on Twitter.
            </a>
          </p>
        </div>
      </div>
      <Suspense fallback={null}>
        <Partners />
      </Suspense>
      <Suspense fallback={null}>
        <Newsletter />
      </Suspense>
    </>
  );
}
