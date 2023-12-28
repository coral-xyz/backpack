import { lazy, Suspense } from 'react';

const Hero = lazy(() => import('../components/Hero'));
const Posts = lazy(() => import('../components/Posts'));
const Newsletter = lazy(() => import('../components/Newsletter'));
const Partners = lazy(() => import('../components/Partners'));

export default function Home() {
  return (
    <div className="mb-20 flex flex-col gap-10">
      <Suspense fallback={null}>
        <Posts />
      </Suspense>
      {/*
      <Suspense fallback={null}>
        <Partners />
      </Suspense>
			*/}
      <Suspense fallback={null}>
        <Newsletter />
      </Suspense>
    </div>
  );
}
