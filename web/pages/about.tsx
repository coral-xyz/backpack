/* eslint-disable max-len */
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { HeroSection } from '../components';

const Partners = dynamic(() => import('../components/Partners'));

export default function About() {
  return (
    <>
      <HeroSection
        title={
          <>
            Welcome to <span className="dark:text-text-primary text-primary">Backpack!</span>
          </>
        }
      >
        <p className="text-gray-700 dark:text-gray-300">
          Backpack is brought to you by{' '}
          <Link href="https://www.coral.community/" className="b-link">
            Coral
          </Link>
          , The team behind the{' '}
          <Link href="https://github.com/coral-xyz/anchor" className="b-link">
            Anchor Framework{' '}
          </Link>
          and{' '}
          <Link href="https://www.coral.community/post/wtf-are-xnfts" className="b-link">
            xNFTs
          </Link>
          . We&#39;re building products, protocols and primitives for Web3. If that interests you,{' '}
          <Link href="mailto:admin+jobs@200ms.io" className="b-link">
            Email us
          </Link>
          .
        </p>
      </HeroSection>

      <Partners />
    </>
  );
}
