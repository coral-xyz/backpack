export default function Terms() {
  return (
    <div className="mx-auto mb-28 flex flex-col items-center gap-16">
      <h1
        className="mt-4 text-4xl font-extrabold tracking-tight
        text-zinc-50 sm:mt-5 sm:text-6xl lg:mt-6 xl:text-6xl"
      >
        Terms of Service
      </h1>
      <div className="text-zinc-50">
        Complete Terms of Service can be viewed{' '}
        <a className="text-teal-500" href="/terms.pdf" target="_blank" rel="noopener noreferrer">
          here
        </a>
      </div>
    </div>
  );
}
