import dynamic from 'next/dynamic';

const Hero = dynamic(() => import('../components/Hero'));
const Posts = dynamic(() => import('../components/Posts'));
const Newsletter = dynamic(() => import('../components/Newsletter'));
const Partners = dynamic(() => import('../components/Partners'));

export default function Home() {
  return (
    <div className="mb-20 flex flex-col gap-10">
      <Hero />
      <Posts />
      <Partners />
      <Newsletter />
    </div>
  );
}
