import { memo } from 'react';

function MintApp({ uploadState, uploadDispatch }: MintAppProps) {
  return (
    <div
      className="flex cursor-pointer flex-col gap-8 rounded-xl bg-gray-700 
    px-14 py-10 hover:bg-gray-700/80"
    >
      <a
        className="text-center text-gray-300"
        href={uploadState.transaction}
        target="_blank"
        rel="noreferrer"
      >
        Transaction
      </a>
    </div>
  );
}

interface MintAppProps {
  uploadState: any;
  uploadDispatch: any;
}

export default memo(MintApp);
